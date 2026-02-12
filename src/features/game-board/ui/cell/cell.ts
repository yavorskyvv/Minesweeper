import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CellState, GameState } from '../../model';
import { CellAnimationDirective } from './cell-animation.directive';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.html',
  styleUrl: './cell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CellAnimationDirective],
})
export class CellComponent {
  readonly state = input.required<CellState>();
  readonly gameState = input.required<GameState>();
  readonly isGameOver = computed(() => this.gameState() === 'GAME_OVER');
  readonly isGameWon = computed(() => this.gameState() === 'GAME_WON');

  readonly waveOrigin = input<{ row: number; column: number } | undefined>(undefined);
  readonly tabIndex = input<number>(-1);
  readonly gridWidth = input<number>(1);
  readonly gridHeight = input<number>(1);

  readonly cellClick = output();
  readonly cellFlag = output();
  readonly cellFocus = output();
  readonly cellKey = output<KeyboardEvent>();

  /** Screen-reader label describing cell position and state. */
  readonly ariaLabel = computed(() => {
    const s = this.state();
    const row = s.row + 1;
    const col = s.column + 1;
    const pos = `Row ${row}, column ${col}`;

    if (this.isGameOver() && s.isMine) {
      return `${pos}, mine`;
    }
    if (s.isRevealed) {
      const count = s.adjacentMines;
      const hint = count === 0 ? 'no adjacent mines' : `${count} adjacent mines`;
      return `${pos}, revealed, ${hint}`;
    }
    if (s.isFlagged) {
      return `${pos}, flagged. Press Space to remove flag`;
    }
    return `${pos}, unrevealed. Press Enter to reveal, Space to flag`;
  });
}
