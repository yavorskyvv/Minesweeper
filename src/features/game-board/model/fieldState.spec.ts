import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { MinesweeperStore } from './fieldState';

describe('MinesweeperStore', () => {
  type MinesweeperStoreType = InstanceType<typeof MinesweeperStore>;
  let store: MinesweeperStoreType;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(MinesweeperStore);
  });

  it('resetGame should clear the field and set state to IDLE', () => {
    store.triggerCell(0, 0);
    expect(store.gameState()).toBe('PLAYING');

    store.resetGame();

    expect(store.gameState()).toBe('IDLE');
    for (const row of store.cells()) {
      for (const cell of row) {
        expect(cell.isRevealed).toBe(false);
        expect(cell.isFlagged).toBe(false);
        expect(cell.isMine).toBe(false);
      }
    }
  });

  it('setConfig should update dimensions, mines, and reset to IDLE', () => {
    store.setConfig(8, 8, 10);

    expect(store.width()).toBe(8);
    expect(store.height()).toBe(8);
    expect(store.mines()).toBe(10);
    expect(store.gameState()).toBe('IDLE');
    expect(store.cells().length).toBe(8);
    expect(store.cells()[0].length).toBe(8);
  });
});
