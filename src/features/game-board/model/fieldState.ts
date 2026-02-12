import { GAME_CONFIG } from '../../../shared/config/game';
import { CellState } from './cellState';
import {
  checkIfGameWon,
  createEmptyField,
  createField,
  revealCells,
} from './fieldLogic';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export type GameState = 'GAME_OVER' | 'GAME_WON' | 'PLAYING' | 'IDLE';

interface FieldState {
  width: number;
  height: number;
  mines: number;
  cells: CellState[][];
  gameState: GameState;
}

const initialFieldState: FieldState = {
  gameState: 'IDLE',
  width: GAME_CONFIG.size.width,
  height: GAME_CONFIG.size.height,
  mines: GAME_CONFIG.mines,
  cells: createEmptyField(GAME_CONFIG.size.width, GAME_CONFIG.size.height),
};

export const MinesweeperStore = signalStore(
  { providedIn: 'root' },
  withState(initialFieldState),
  withMethods((store) => ({
    triggerCell: (row: number, column: number) => {
      if (store.gameState() === 'IDLE') {
        const field = createField(store.width(), store.height(), store.mines(), { row, column });
        const cellsAfterTrigger = revealCells(field, row, column);

        patchState(store, {
          gameState: 'PLAYING',
          cells: cellsAfterTrigger,
        });

        if (checkIfGameWon(cellsAfterTrigger)) {
          patchState(store, {
            gameState: 'GAME_WON',
          });
        }
        return;
      }

      if (store.cells()[row][column].isMine) {
        patchState(store, {
          gameState: 'GAME_OVER',
        });
        return;
      }

      const newCells = revealCells(store.cells(), row, column);

      patchState(store, {
        cells: newCells,
      });

      if (checkIfGameWon(newCells)) {
        patchState(store, {
          gameState: 'GAME_WON',
        });
      }
    },

    flagCell: (row: number, column: number) => {
      const newCells = structuredClone(store.cells());
      newCells[row][column].isFlagged = !newCells[row][column].isFlagged;

      patchState(store, {
        cells: newCells,
      });

      if (checkIfGameWon(newCells)) {
        patchState(store, {
          gameState: 'GAME_WON',
        });
      }
    },

    resetGame: () => {
      patchState(store, {
        gameState: 'IDLE',
        cells: createEmptyField(store.width(), store.height()),
      });
    },

    setConfig: (width: number, height: number, mines: number) => {
      patchState(store, {
        width,
        height,
        mines,
        gameState: 'IDLE',
        cells: createEmptyField(width, height),
      });
    },
  })),
);
