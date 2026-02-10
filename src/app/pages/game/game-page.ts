import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
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
    `,
  ],
})
export class GamePageComponent {
  private readonly store = inject(MinesweeperStore);

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
