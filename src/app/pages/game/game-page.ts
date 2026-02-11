import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  effect,
  inject,
} from '@angular/core';
import {
  FieldComponent,
  FieldViewportComponent,
  GameControlsComponent,
} from '../../../features/game-board/ui';
import { MinesweeperStore } from '../../../features/game-board/model/fieldState';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [GameControlsComponent, FieldComponent, FieldViewportComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      aria-live="polite"
      aria-atomic="true"
      class="game-page__sr-status"
    >
      {{ gameStatusMessage() }}
    </div>
    <main class="game-page" (contextmenu)="$event.preventDefault()">
      <app-field-viewport #viewport>
        <div fieldViewportOverlay class="game-page__overlay">
          <app-game-controls />
        </div>
        <app-field fieldViewportField></app-field>
      </app-field-viewport>
    </main>
  `,
  styles: [
    `
      .game-page {
        display: flex;
        flex-direction: column;
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        padding: 0;
        box-sizing: border-box;
        user-select: none;
      }

      .game-page__overlay {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        z-index: 2;
      }

      .game-page__sr-status {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class GamePageComponent {
  private readonly store = inject(MinesweeperStore);

  /** Message announced to screen readers when game ends (win or lose). */
  readonly gameStatusMessage = computed(() => {
    switch (this.store.gameState()) {
      case 'GAME_OVER':
        return 'Game over. You hit a mine.';
      case 'GAME_WON':
        return 'You won!';
      default:
        return '';
    }
  });

  @ViewChild('viewport', { static: true })
  private readonly viewportRef!: FieldViewportComponent;

  constructor() {
    effect(() => {
      const state = this.store.gameState();
      const width = this.store.width();
      const height = this.store.height();
      if (state === 'IDLE' && width > 0 && height > 0) {
        this.viewportRef?.scheduleFit();
      }
    });
  }
}
