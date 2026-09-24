import levelsData from './levels.json';

import type {
  Level,
} from '../types/gameTypes';

export const LEVELS =
  levelsData as Level[];

export type {
  Choice,
  DialogueNode,
  HintConfig,
  Level,
} from '../types/gameTypes';