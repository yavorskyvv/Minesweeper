import { describe, it, expect } from 'vitest';
import { DEFAULT_DIFFICULTY, DIFFICULTY_CONFIGS, GAME_CONFIG } from './game';

describe('game config', () => {
  it('should use the default difficulty as GAME_CONFIG', () => {
    expect(GAME_CONFIG).toEqual(DIFFICULTY_CONFIGS[DEFAULT_DIFFICULTY]);
  });

  it('should define beginner, intermediate, and expert presets', () => {
    expect(DIFFICULTY_CONFIGS.beginner).toBeTruthy();
    expect(DIFFICULTY_CONFIGS.intermediate).toBeTruthy();
    expect(DIFFICULTY_CONFIGS.expert).toBeTruthy();
  });
});

