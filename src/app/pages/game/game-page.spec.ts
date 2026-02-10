import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { GamePageComponent } from './game-page';

describe('GamePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePageComponent],
    }).compileComponents();
  });

  it('should render game controls and field', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-game-controls')).toBeTruthy();
    expect(compiled.querySelector('app-field')).toBeTruthy();
  });

  it('should render the viewport', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="field-viewport"]')).toBeTruthy();
  });
});
