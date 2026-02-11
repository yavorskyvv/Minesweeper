import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MinesweeperStore } from '../../model/fieldState';
import { DIFFICULTY_CONFIGS, DifficultyId } from '../../../../shared/config/game';

interface DifficultyOption {
  id: DifficultyId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-game-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="game-controls" aria-label="Game controls">
      <div class="game-controls__difficulty" role="radiogroup" aria-label="Difficulty">
        @for (option of difficultyOptions; track option.id) {
          <button
            type="button"
            class="game-controls__difficulty-button"
            [class.game-controls__difficulty-button--active]="selectedDifficultyId() === option.id"
            role="radio"
            [attr.aria-checked]="selectedDifficultyId() === option.id"
            [attr.aria-label]="option.label"
            [attr.data-testid]="'difficulty-' + option.id"
            (click)="onDifficultySelect(option.id)"
          >
            <span class="game-controls__icon" aria-hidden="true">{{ option.icon }}</span>
          </button>
        }
      </div>

      <div class="game-controls__group">
        <button
          type="button"
          class="game-controls__button"
          data-testid="reset-button"
          (click)="onReset()"
        >
          New game
        </button>
      </div>
    </section>
  `,
  styles: [
    `
      .game-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        gap: 0.75rem;
      }

      .game-controls__difficulty {
        display: inline-flex;
        gap: 0.5rem;
        padding: 0.25rem;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid var(--ms-border);
      }

      .game-controls__difficulty-button {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 4px;
        border: 1px solid transparent;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--ms-text);
        cursor: pointer;
      }

      .game-controls__difficulty-button--active {
        background: var(--ms-bg-revealed);
        border-color: var(--ms-border);
        box-shadow: inset 0 0 0 1px var(--ms-border);
      }

      .game-controls__icon {
        font-family: 'Material Symbols Rounded';
        font-size: 1.25rem;
        line-height: 1;
        font-variation-settings:
          'FILL' 1,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }

      .game-controls__group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }

      .game-controls__button {
        min-height: 2.25rem;
        padding-inline: 0.75rem;
        padding-block: 0.25rem;
        font: inherit;
        border-radius: 4px;
        border: 1px solid var(--ms-border);
        background-color: #fff;
        color: var(--ms-text);
      }

      .game-controls__button {
        cursor: pointer;
      }

      .game-controls__button:focus-visible,
      .game-controls__difficulty-button:focus-visible {
        outline: 2px solid var(--ms-border);
        outline-offset: 2px;
      }

      @media (max-width: 480px) {
        .game-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .game-controls__group {
          justify-content: space-between;
        }

        .game-controls__button {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class GameControlsComponent {
  private readonly store = inject(MinesweeperStore);

  readonly difficultyOptions: DifficultyOption[] = [
    { id: 'beginner', label: 'Beginner', icon: 'looks_one' },
    { id: 'intermediate', label: 'Intermediate', icon: 'looks_two' },
    { id: 'expert', label: 'Expert', icon: 'looks_3' },
  ];

  readonly selectedDifficultyId = computed<DifficultyId | null>(() => {
    const width = this.store.width();
    const height = this.store.height();
    const mines = this.store.mines();

    for (const [id, config] of Object.entries(DIFFICULTY_CONFIGS)) {
      if (config.size.width === width && config.size.height === height && config.mines === mines) {
        return id as DifficultyId;
      }
    }

    return null;
  });

  onDifficultySelect(value: DifficultyId) {
    const config = DIFFICULTY_CONFIGS[value];
    if (!config) {
      return;
    }

    this.store.setConfig(config.size.width, config.size.height, config.mines);
  }

  onReset() {
    this.store.resetGame();
  }
}
