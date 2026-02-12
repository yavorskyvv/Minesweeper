import { CellState } from './cellState';

export function createEmptyField(width: number, height: number): CellState[][] {
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

export function createField(
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

export function revealCells(
  cells: CellState[][],
  row: number,
  column: number,
): CellState[][] {
  const next = structuredClone(cells);

  if (cells[row][column].adjacentMines !== 0) {
    next[row][column].isRevealed = true;
    return next;
  }

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
      if (visited.has(neighborKey)) {
        continue;
      }

      const neighborCell = next[neighbor.row][neighbor.column];
      next[neighbor.row][neighbor.column] = { ...neighborCell, isRevealed: true };

      if (neighborCell.adjacentMines === 0) {
        stack.push(next[neighbor.row][neighbor.column]);
      } else {
        visited.add(neighborKey);
      }
    }
  }

  return next;
}

export function checkIfGameWon(cells: CellState[][]): boolean {
  return cells.every((cellRow) =>
    cellRow.every((cell) => (cell.isMine && cell.isFlagged) || cell.isRevealed),
  );
}

function getFirstClickForbiddenCoordinates(
  height: number,
  width: number,
  origin: { row: number; column: number },
): Set<string> {
  const forbidden = new Set<string>();
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dColumn = -1; dColumn <= 1; dColumn++) {
      const r = origin.row + dRow;
      const c = origin.column + dColumn;
      if (r >= 0 && r < height && c >= 0 && c < width) {
        forbidden.add(`${r}:${c}`);
      }
    }
  }
  return forbidden;
}

const MINE_CLUSTER_RADIUS = 2;
const CLUSTER_PLACEMENT_ATTEMPTS = 50;

function pickClusterCenters(
  height: number,
  width: number,
  mineCount: number,
): Array<{ row: number; column: number }> {
  const numClusters = Math.max(1, Math.min(8, Math.ceil(mineCount / 5)));
  const centers: Array<{ row: number; column: number }> = [];
  for (let i = 0; i < numClusters; i++) {
    centers.push({
      row: Math.floor(Math.random() * height),
      column: Math.floor(Math.random() * width),
    });
  }
  return centers;
}

function placeOneMine(
  field: CellState[][],
  row: number,
  column: number,
): void {
  field[row][column].isMine = true;
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

function placeMines(
  field: CellState[][],
  mines: number,
  origin?: { row: number; column: number },
): void {
  const height = field.length;
  const width = height > 0 ? field[0].length : 0;
  const forbidden =
    origin != null
      ? getFirstClickForbiddenCoordinates(height, width, origin)
      : new Set<string>();

  const centers = pickClusterCenters(height, width, mines);

  let minesLeft = mines;
  while (minesLeft > 0) {
    let row: number;
    let column: number;
    let attempts = 0;

    do {
      const center = centers[Math.floor(Math.random() * centers.length)];
      const dRow =
        Math.floor(Math.random() * (2 * MINE_CLUSTER_RADIUS + 1)) - MINE_CLUSTER_RADIUS;
      const dColumn =
        Math.floor(Math.random() * (2 * MINE_CLUSTER_RADIUS + 1)) - MINE_CLUSTER_RADIUS;
      row = Math.max(0, Math.min(height - 1, center.row + dRow));
      column = Math.max(0, Math.min(width - 1, center.column + dColumn));
      attempts++;
    } while (
      attempts < CLUSTER_PLACEMENT_ATTEMPTS &&
      (field[row][column].isMine || forbidden.has(`${row}:${column}`))
    );

    if (field[row][column].isMine || forbidden.has(`${row}:${column}`)) {
      row = Math.floor(Math.random() * height);
      column = Math.floor(Math.random() * width);
      while (field[row][column].isMine || forbidden.has(`${row}:${column}`)) {
        row = Math.floor(Math.random() * height);
        column = Math.floor(Math.random() * width);
      }
    }

    placeOneMine(field, row, column);
    minesLeft--;
  }
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
