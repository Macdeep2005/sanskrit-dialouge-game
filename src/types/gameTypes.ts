export interface HintConfig {
  enabled: boolean;
  type: string;
  text: string;
  cost: number;
}

export interface Choice {
  id: string;
  choiceText: string;
  choiceTranslation: string;
  choiceAudioPath: string;
  isCorrect: boolean;
  feedback?: string;
  nextNodeId: string | 'END';
}

export interface DialogueNode {
  id: string;

  speaker: string;

  npcText: string;
  npcTranslation: string;

  npcAudioPath: string;

  backgroundImage: string;

  npcSprite: string;
  playerSprite: string;

  requiresNameInput?: boolean;

  hint?: HintConfig;

  choices: Choice[];
}

export interface Level {
  id: number;

  title: string;
  subtitle: string;

  icon: string;

  accentColor: string;

  thumbnailImage: string;

  startNodeId: string;

  nodes: Record<string, DialogueNode>;
}