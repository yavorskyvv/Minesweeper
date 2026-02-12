export type DifficultyId = 'beginner' | 'intermediate' | 'expert';

export interface GameConfig {
  size: {
    width: number;
    height: number;
  };
  mines: number;
}

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;
const DEFAULT_MINES = Math.ceil(0.2 * DEFAULT_WIDTH * DEFAULT_HEIGHT);

export const DIFFICULTY_CONFIGS: Record<DifficultyId, GameConfig> = {
  beginner: {
    size: {
      width: 8,
      height: 8,
    },
    mines: Math.ceil(0.2 * 8 * 8),
  },
  intermediate: {
    size: {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    },
    mines: DEFAULT_MINES,
  },
  expert: {
    size: {
      width: 16,
      height: 16,
    },
    mines: Math.ceil(0.2 * 16 * 16),
  },
};

export const DEFAULT_DIFFICULTY: DifficultyId = 'intermediate';

export const GAME_CONFIG: GameConfig = DIFFICULTY_CONFIGS[DEFAULT_DIFFICULTY];
