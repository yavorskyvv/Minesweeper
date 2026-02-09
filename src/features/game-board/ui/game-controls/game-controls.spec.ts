import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { GameControlsComponent } from './game-controls';
import { MinesweeperStore } from '../../model/fieldState';
import { DIFFICULTY_CONFIGS } from '../../../../shared/config/game';

describe('GameControlsComponent', () => {
  type MinesweeperStoreType = InstanceType<typeof MinesweeperStore>;
  let store: MinesweeperStoreType;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameControlsComponent],
    }).compileComponents();

    store = TestBed.inject(MinesweeperStore);
  });

  it('should render difficulty buttons and reset button', () => {
    const fixture = TestBed.createComponent(GameControlsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="difficulty-beginner"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="difficulty-intermediate"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="difficulty-expert"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="reset-button"]')).toBeTruthy();
  });

  it('should reset the game when reset button is clicked', () => {
    const fixture = TestBed.createComponent(GameControlsComponent);
    store.triggerCell(0, 0);
    expect(store.gameState()).toBe('PLAYING');

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const resetButton = compiled.querySelector('[data-testid="reset-button"]') as HTMLButtonElement;

    resetButton.click();
    fixture.detectChanges();

    expect(store.gameState()).toBe('IDLE');
  });

  it('should update config when a preset difficulty is selected', () => {
    const fixture = TestBed.createComponent(GameControlsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const beginnerButton = compiled.querySelector(
      '[data-testid="difficulty-beginner"]',
    ) as HTMLButtonElement;

    beginnerButton.click();
    fixture.detectChanges();

    const beginner = DIFFICULTY_CONFIGS.beginner;
    expect(store.width()).toBe(beginner.size.width);
    expect(store.height()).toBe(beginner.size.height);
    expect(store.mines()).toBe(beginner.mines);
  });
});
