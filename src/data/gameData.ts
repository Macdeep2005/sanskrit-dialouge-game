import levelsData from './levels.json';

import type {
  Level,
} from '../types/gameTypes';

export const LEVELS =
  levelsData as unknown as Level[];

export type {
  Choice,
  DialogueNode,
  HintConfig,
  Level,
} from '../types/gameTypes';
