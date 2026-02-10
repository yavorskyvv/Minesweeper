import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldViewportComponent } from './field-viewport';

describe('FieldViewportComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldViewportComponent],
    }).compileComponents();
  });

  it('should render the viewport', () => {
    const fixture = TestBed.createComponent(FieldViewportComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="field-viewport"]')).toBeTruthy();
  });

  function startPanning(viewport: HTMLElement): void {
    // jsdom does not implement pointer capture APIs, so we stub them.
    (viewport as unknown as { setPointerCapture: () => void }).setPointerCapture = vi.fn();
    (viewport as unknown as { releasePointerCapture: () => void }).releasePointerCapture = vi.fn();

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
  }

  it('should set isPanning to true after drag past threshold and keep it until release', () => {
    const fixture = TestBed.createComponent(FieldViewportComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const viewport = compiled.querySelector('[data-testid="field-viewport"]') as HTMLElement;
    const component = fixture.componentInstance;

    startPanning(viewport);

    expect(component.isPanning()).toBe(true);

    // No pointerup dispatched – panning must still be true (avoids false positive)
    expect(component.isPanning()).toBe(true);
  });

  it('should stop panning when pointer is released on the viewport', () => {
    const fixture = TestBed.createComponent(FieldViewportComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const viewport = compiled.querySelector('[data-testid="field-viewport"]') as HTMLElement;
    const component = fixture.componentInstance;

    startPanning(viewport);
    expect(component.isPanning()).toBe(true);

    viewport.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));

    expect(component.isPanning()).toBe(false);
  });

  it('should stop panning when pointer is released outside the viewport (window)', () => {
    const fixture = TestBed.createComponent(FieldViewportComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const viewport = compiled.querySelector('[data-testid="field-viewport"]') as HTMLElement;
    const component = fixture.componentInstance;

    startPanning(viewport);
    expect(component.isPanning()).toBe(true);

    // Simulate release outside viewport: only window listeners receive this
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));

    expect(component.isPanning()).toBe(false);
  });
});
