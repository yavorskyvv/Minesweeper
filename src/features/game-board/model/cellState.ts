export interface CellState {
  id: `${number}:${number}`;
  i: number;
  j: number;
  isMine: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
  adjacentMines: number;
}
