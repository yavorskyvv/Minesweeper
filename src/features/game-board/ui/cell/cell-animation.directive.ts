import { Directive, input } from '@angular/core';

const WIN_WAVE_TOTAL_MS = 600;

@Directive({
  selector: '[appCellAnimation]',
  standalone: true,
  host: {
    '[style.--transition-delay]': 'transitionDelayStyle',
    '[style.--win-wave-delay]': 'winWaveDelayStyle',
  },
})
export class CellAnimationDirective {
  readonly delayMs = input<number>(0);
  readonly isGameWon = input<boolean>(false);
  readonly row = input<number>(0);
  readonly column = input<number>(0);
  readonly gridWidth = input<number>(1);
  readonly gridHeight = input<number>(1);

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
