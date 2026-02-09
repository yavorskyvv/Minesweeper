import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
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

  readonly waveOrigin = input<{ i: number; j: number } | undefined>(undefined);
  readonly tabIndex = input<number>(-1);
  readonly gridWidth = input<number>(1);
  readonly gridHeight = input<number>(1);

  readonly delayMs = linkedSignal(() => {
    const row = this.state().i;
    const column = this.state().j;

    const originRow = this.waveOrigin()?.i ?? row;
    const originColumn = this.waveOrigin()?.j ?? column;

    return (Math.abs(row - originRow) + Math.abs(column - originColumn)) * 100;
  });

  readonly cellClick = output();
  readonly cellFlag = output();
  readonly cellFocus = output();
  readonly cellKey = output<KeyboardEvent>();
}
