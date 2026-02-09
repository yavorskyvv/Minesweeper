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
    createField: () => {
      patchState(store, {
        cells: createField(store.width(), store.height(), store.mines()) as CellState[][],
      });
    },

    triggerCell: (i: number, j: number) => {
      if (store.gameState() === 'IDLE') {
        const field = createField(store.width(), store.height(), store.mines(), { i, j });
        patchState(store, {
          gameState: 'PLAYING',
          cells: triggerCell(field, i, j),
        });
        return;
      }

      if (store.cells()[i][j].isMine) {
        patchState(store, {
          gameState: 'GAME_OVER',
        });
        return;
      }

      patchState(store, {
        cells: triggerCell(store.cells(), i, j),
      });
    },

    flagCell: (i: number, j: number) => {
      const newCells = structuredClone(store.cells());
      newCells[i][j].isFlagged = !newCells[i][j].isFlagged;
      const isAllMinesFlagged = checkifAllMinesFlagged(newCells);

      patchState(store, {
        cells: newCells,
      });

      if (isAllMinesFlagged) {
        patchState(store, {
          gameState: 'GAME_WON',
        });
      }
    },
  })),
);

function createEmptyField(width: number, height: number): CellState[][] {
  const field: CellState[][] = [];
  for (let i = 0; i < height; i++) {
    field.push([]);
    for (let j = 0; j < width; j++) {
      field[i].push({
        id: `${i}:${j}`,
        i,
        j,
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
  origin?: { i: number; j: number },
): CellState[][] {
  const field = createEmptyField(width, height);

  if (mines > 0) {
    placeMines(field, mines, origin);
  }
  return field;
}

function placeMines(field: CellState[][], mines: number, origin?: { i: number; j: number }): void {
  let minesLeft = mines;
  while (minesLeft > 0) {
    const row = Math.floor(Math.random() * field.length);
    const column = Math.floor(Math.random() * field[row].length);
    const isOriginCell = origin?.i === row && origin?.j === column;
    if (!field[row][column].isMine && !isOriginCell) {
      field[row][column].isMine = true;
      minesLeft--;
      // increment adjacent mines for all cells around the mine
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (
            row + i >= 0 &&
            row + i < field.length &&
            column + j >= 0 &&
            column + j < field[row + i].length
          ) {
            field[row + i][column + j].adjacentMines++;
          }
        }
      }
    }
  }
}

function triggerCell(cells: CellState[][], i: number, j: number): CellState[][] {
  const next = cells.map((row) => row.map((cell) => ({ ...cell })));
  const stack = [next[i][j]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const popped = stack.pop()!;
    const key = `${popped.i}:${popped.j}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (!popped.isRevealed) {
      next[popped.i][popped.j] = { ...popped, isRevealed: true };
    }

    const current = next[popped.i][popped.j];
    for (const neighbor of getAdjacentCells(next, current)) {
      const neighborKey = `${neighbor.i}:${neighbor.j}`;
      if (!visited.has(neighborKey)) {
        stack.push(neighbor);
      }
    }
  }

  return next;
}

function getAdjacentCells(cells: CellState[][], cell: CellState): CellState[] {
  const res: CellState[] = [];
  const height = cells.length;
  const width = height > 0 ? cells[0].length : 0;

  const positions = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
  ];

  for (const pos of positions) {
    const nextI = cell.i + pos[0];
    const nextJ = cell.j + pos[1];
    if (nextI < 0 || nextI >= height || nextJ < 0 || nextJ >= width) {
      continue;
    }
    const candidate = cells[nextI][nextJ];
    if (!candidate.isMine) {
      res.push(candidate);
    }
  }
  return res;
}

function checkifAllMinesFlagged(cells: CellState[][]) {
  return cells.every((cellRow) =>
    cellRow.every((cell) => (cell.isMine && cell.isFlagged) || cell.isRevealed),
  );
}
