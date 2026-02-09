import { GAME_CONFIG } from '../../../shared/config/game';
import { CellState } from './cellState';
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

function createEmptyField(width: number, height: number): CellState[][] {
  const field: CellState[][] = [];
  for (let row = 0; row < height; row++) {
    field.push([]);
    for (let column = 0; column < width; column++) {
      field[row].push({
        row,
        column,
        isMine: false,
        isFlagged: false,
        isRevealed: false,
        adjacentMines: 0,
      });
    }
  }

  return field;
}

function createField(
  width: number,
  height: number,
  mines: number,
  origin?: { row: number; column: number },
): CellState[][] {
  const field = createEmptyField(width, height);

  if (mines > 0) {
    placeMines(field, mines, origin);
  }
  return field;
}

function placeMines(
  field: CellState[][],
  mines: number,
  origin?: { row: number; column: number },
): void {
  let minesLeft = mines;
  while (minesLeft > 0) {
    const row = Math.floor(Math.random() * field.length);
    const column = Math.floor(Math.random() * field[row].length);
    const isOriginCell = origin?.row === row && origin?.column === column;
    if (!field[row][column].isMine && !isOriginCell) {
      field[row][column].isMine = true;
      minesLeft--;
      for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dColumn = -1; dColumn <= 1; dColumn++) {
          if (
            row + dRow >= 0 &&
            row + dRow < field.length &&
            column + dColumn >= 0 &&
            column + dColumn < field[row + dRow].length
          ) {
            field[row + dRow][column + dColumn].adjacentMines++;
          }
        }
      }
    }
  }
}

function revealCells(cells: CellState[][], row: number, column: number): CellState[][] {
  const next = cells.map((cellRow) => cellRow.map((cell) => ({ ...cell })));
  const stack = [next[row][column]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const popped = stack.pop()!;
    const key = `${popped.row}:${popped.column}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (!popped.isRevealed) {
      next[popped.row][popped.column] = { ...popped, isRevealed: true };
    }

    const current = next[popped.row][popped.column];
    for (const neighbor of getAdjacentCells(next, current)) {
      const neighborKey = `${neighbor.row}:${neighbor.column}`;
      if (!visited.has(neighborKey)) {
        stack.push(neighbor);
      }
    }
  }

  return next;
}

function getAdjacentCells(cells: CellState[][], cell: CellState): CellState[] {
  const result: CellState[] = [];
  const height = cells.length;
  const width = height > 0 ? cells[0].length : 0;

  const positions: Array<[number, number]> = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
  ];

  for (const [dRow, dColumn] of positions) {
    const nextRow = cell.row + dRow;
    const nextColumn = cell.column + dColumn;
    if (nextRow < 0 || nextRow >= height || nextColumn < 0 || nextColumn >= width) {
      continue;
    }
    const candidate = cells[nextRow][nextColumn];
    if (!candidate.isMine) {
      result.push(candidate);
    }
  }
  return result;
}

function checkIfGameWon(cells: CellState[][]): boolean {
  return cells.every((cellRow) =>
    cellRow.every((cell) => (cell.isMine && cell.isFlagged) || cell.isRevealed),
  );
}
