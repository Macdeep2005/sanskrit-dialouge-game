import type {
  Choice,
  DialogueNode,
  HintConfig,
  Level,
} from '../types/gameTypes';
import { collection, getDocs } from 'firebase/firestore';
import { levelsDb } from '../levels-config';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHintConfig(value: unknown): value is HintConfig {
  return (
    isRecord(value) &&
    typeof value.enabled === 'boolean' &&
    typeof value.type === 'string' &&
    typeof value.text === 'string' &&
    typeof value.cost === 'number'
  );
}

function isChoice(value: unknown): value is Choice {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.choiceText === 'string' &&
    typeof value.choiceTranslation === 'string' &&
    typeof value.choiceAudioPath === 'string' &&
    typeof value.isCorrect === 'boolean' &&
    typeof value.nextNodeId === 'string' &&
    (value.feedback === undefined || typeof value.feedback === 'string')
  );
}

function isDialogueNode(value: unknown): value is DialogueNode {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.speaker === 'string' &&
    typeof value.npcText === 'string' &&
    typeof value.npcTranslation === 'string' &&
    typeof value.npcAudioPath === 'string' &&
    typeof value.backgroundImage === 'string' &&
    typeof value.npcSprite === 'string' &&
    typeof value.playerSprite === 'string' &&
    (value.requiresNameInput === undefined ||
      typeof value.requiresNameInput === 'boolean') &&
    (value.hint === undefined || isHintConfig(value.hint)) &&
    Array.isArray(value.choices) &&
    value.choices.every(isChoice)
  );
}

function isLevel(value: unknown): value is Level {
  if (
    !isRecord(value) ||
    typeof value.id !== 'number' ||
    typeof value.title !== 'string' ||
    typeof value.subtitle !== 'string' ||
    typeof value.icon !== 'string' ||
    typeof value.accentColor !== 'string' ||
    typeof value.thumbnailImage !== 'string' ||
    typeof value.startNodeId !== 'string' ||
    !isRecord(value.nodes)
  ) {
    return false;
  }

  return (
    Object.values(value.nodes).length > 0 &&
    Object.values(value.nodes).every(isDialogueNode) &&
    value.startNodeId in value.nodes
  );
}

export async function loadLevels(): Promise<Level[]> {
  const snapshot = await getDocs(collection(levelsDb, 'levels'));

  if (snapshot.empty) {
    throw new Error('The Firebase "levels" collection is empty.');
  }

  const levelDocuments = snapshot.docs.filter((document) =>
    /^level_\d+$/.test(document.id),
  );

  if (levelDocuments.length === 0) {
    throw new Error('No numbered level documents were found in the "levels" collection.');
  }

  const levels = levelDocuments.map((document) => {
    const idMatch = /^level_(\d+)$/.exec(document.id)!;

    const documentData: unknown = document.data();

    if (!isRecord(documentData)) {
      throw new Error(`Level document ${document.id} has invalid data.`);
    }

    const nodes = isRecord(documentData.nodes) ? documentData.nodes : null;

    if (!nodes) {
      throw new Error(`Level document ${document.id} must contain a nodes object.`);
    }

    const background =
      typeof documentData.background === 'string'
        ? documentData.background
        : typeof documentData.backgroundImage === 'string'
          ? documentData.backgroundImage
          : '';
    const nodeEntries = Object.entries(nodes).map(([nodeId, rawNode]) => {
      if (!isRecord(rawNode)) {
        throw new Error(`Node ${nodeId} in ${document.id} has invalid data.`);
      }

      return [
        nodeId,
        {
          ...rawNode,
          id: typeof rawNode.id === 'string' ? rawNode.id : nodeId,
          backgroundImage:
            typeof rawNode.backgroundImage === 'string'
              ? rawNode.backgroundImage
              : background,
        },
      ];
    });
    const normalizedLevel = {
      ...documentData,
      id: Number(idMatch[1]),
      accentColor:
        typeof documentData.accentColor === 'string'
          ? documentData.accentColor
          : '#2dd4bf',
      thumbnailImage:
        typeof documentData.thumbnailImage === 'string'
          ? documentData.thumbnailImage
          : background,
      startNodeId:
        typeof documentData.startNodeId === 'string'
          ? documentData.startNodeId
          : nodeEntries[0]?.[0],
      nodes: Object.fromEntries(nodeEntries),
    };

    if (!isLevel(normalizedLevel)) {
      throw new Error(`Level document ${document.id} does not match the game data format.`);
    }

    return normalizedLevel;
  });

  return levels.sort((left, right) => left.id - right.id);
}

export type {
  Choice,
  DialogueNode,
  HintConfig,
  Level,
} from '../types/gameTypes';
