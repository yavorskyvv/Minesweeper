import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('should stop panning when pointer is released outside the viewport', () => {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const viewport = compiled.querySelector('[data-testid="field-viewport"]') as HTMLElement;

    // jsdom does not implement pointer capture APIs, so we stub them.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (viewport as any).setPointerCapture = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (viewport as any).releasePointerCapture = vi.fn();

    viewport.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        button: 0,
        clientX: 100,
        clientY: 100,
        bubbles: true,
      }),
    );

    viewport.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: 120,
        clientY: 100,
        bubbles: true,
      }),
    );

    const component = fixture.componentInstance;
    expect(component.isPanning()).toBe(true);

    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        bubbles: true,
      }),
    );

    expect(component.isPanning()).toBe(false);
  });
});

