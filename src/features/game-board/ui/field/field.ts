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
  readonly waveOrigin = signal<{ i: number; j: number } | undefined>(undefined);
  readonly focusedCell = signal<{ i: number; j: number }>({ i: 0, j: 0 });

  onCellClick(row: number, cell: number) {
    this.store$.triggerCell(row, cell);
    this.waveOrigin.set({ i: row, j: cell });
    this.setFocus(row, cell);
  }
  onCellFlag(row: number, cell: number) {
    this.store$.flagCell(row, cell);
  }

  setFocus(row: number, cell: number) {
    this.focusedCell.set({ i: row, j: cell });
  }

  isFocused(row: number, cell: number) {
    const focused = this.focusedCell();
    return focused.i === row && focused.j === cell;
  }

  onCellKey(row: number, cell: number, event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row - 1, cell);
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row + 1, cell);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row, cell - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(row, cell + 1);
        break;
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        this.onCellClick(row, cell);
        break;
      case ' ':
      case 'Space':
      case 'Spacebar':
        event.preventDefault();
        event.stopPropagation();
        this.onCellFlag(row, cell);
        break;
      default:
        break;
    }
  }

  private moveFocus(row: number, cell: number) {
    const maxRow = this.store$.height() - 1;
    const maxCell = this.store$.width() - 1;
    const nextRow = row < 0 ? maxRow : row > maxRow ? 0 : row;
    const nextCell = cell < 0 ? maxCell : cell > maxCell ? 0 : cell;
    this.setFocus(nextRow, nextCell);
    queueMicrotask(() => this.focusCell(nextRow, nextCell));
  }

  private focusCell(row: number, cell: number) {
    const element = document.getElementById(`cell-${row}-${cell}`);
    element?.focus();
  }
}
