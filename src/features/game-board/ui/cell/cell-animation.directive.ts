import { Directive, computed, input } from '@angular/core';

const WIN_WAVE_TOTAL_MS = 600;
const REVEAL_DELAY_PER_STEP_MS = 100;

@Directive({
  selector: '[appCellAnimation]',
  standalone: true,
  host: {
    '[style.--transition-delay]': 'transitionDelayStyle',
    '[style.--win-wave-delay]': 'winWaveDelayStyle',
  },
})
export class CellAnimationDirective {
  readonly waveOrigin = input<{ row: number; column: number } | undefined>(undefined);
  readonly isGameWon = input<boolean>(false);
  readonly row = input<number>(0);
  readonly column = input<number>(0);
  readonly gridWidth = input<number>(1);
  readonly gridHeight = input<number>(1);

  private readonly delayMs = computed(() => {
    const row = this.row();
    const column = this.column();
    const origin = this.waveOrigin();
    const originRow = origin?.row ?? row;
    const originColumn = origin?.column ?? column;
    return (Math.abs(row - originRow) + Math.abs(column - originColumn)) * REVEAL_DELAY_PER_STEP_MS;
  });

  get transitionDelayStyle(): string {
    return `${this.delayMs()}ms`;
  }

  get winWaveDelayStyle(): string {
    if (!this.isGameWon()) return '0ms';
    const w = this.gridWidth();
    const h = this.gridHeight();
    const maxDiagonal = Math.max(1, w + h - 2);
    const stepMs = WIN_WAVE_TOTAL_MS / maxDiagonal;
    return `${(this.row() + this.column()) * stepMs}ms`;
  }
}
