export interface CellState {
  row: number;
  column: number;
  isMine: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
  adjacentMines: number;
}
