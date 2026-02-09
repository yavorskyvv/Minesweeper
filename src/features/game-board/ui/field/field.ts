import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MinesweeperStore } from '../../model/fieldState';
import { CellComponent } from '../cell/cell';

@Component({
  selector: 'app-field',
  templateUrl: './field.html',
  styleUrl: './field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CellComponent],
})
export class FieldComponent {
  readonly store$ = inject(MinesweeperStore);
  readonly waveOrigin = signal<{ row: number; column: number } | undefined>(undefined);
  readonly focusedCell = signal<{ row: number; column: number }>({ row: 0, column: 0 });

  onCellClick(row: number, column: number) {
    this.store$.triggerCell(row, column);
    this.waveOrigin.set({ row, column });
    this.setFocus(row, column);
  }
  onCellFlag(row: number, column: number) {
    this.store$.flagCell(row, column);
  }

  setFocus(row: number, column: number) {
    this.focusedCell.set({ row, column });
  }

  isFocused(row: number, column: number) {
    const focused = this.focusedCell();
    return focused.row === row && focused.column === column;
  }

  onCellKey(row: number, column: number, event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row - 1, column);
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row + 1, column);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row, column - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row, column + 1);
        break;
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        this.onCellClick(row, column);
        break;
      case ' ':
      case 'Space':
      case 'Spacebar':
        event.preventDefault();
        event.stopPropagation();
        this.onCellFlag(row, column);
        break;
      default:
        break;
    }
  }

  private moveFocus(row: number, column: number) {
    const maxRow = this.store$.height() - 1;
    const maxColumn = this.store$.width() - 1;
    const nextRow = row < 0 ? maxRow : row > maxRow ? 0 : row;
    const nextColumn = column < 0 ? maxColumn : column > maxColumn ? 0 : column;
    this.setFocus(nextRow, nextColumn);
    queueMicrotask(() => this.focusCell(nextRow, nextColumn));
  }

  private focusCell(row: number, column: number) {
    const element = document.getElementById(`cell-${row}-${column}`);
    element?.focus();
  }
}
