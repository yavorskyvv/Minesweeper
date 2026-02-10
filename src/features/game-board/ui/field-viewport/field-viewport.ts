import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const PAN_THRESHOLD_PX = 8;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

@Component({
  selector: 'app-field-viewport',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #viewport
      class="field-viewport"
      [class.field-viewport--panning]="isPanning()"
      data-testid="field-viewport"
      tabindex="0"
      aria-label="Game field viewport"
      (wheel)="onWheel($event)"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
    >
      <ng-content select="[fieldViewportOverlay]"></ng-content>
      <div #fieldWrapper class="field-viewport__field" [style.transform]="transformStyle()">
        <ng-content select="[fieldViewportField]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1;
        min-height: 0;
        width: 100%;
        height: 100%;
      }

      .field-viewport {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
        touch-action: none;
        cursor: grab;
      }

      .field-viewport--panning {
        cursor: grabbing;
      }

      .field-viewport__field {
        display: inline-block;
        transform-origin: top left;
        will-change: transform;
      }
    `,
  ],
})
export class FieldViewportComponent implements OnInit, OnDestroy {
  @ViewChild('viewport', { static: true })
  private readonly viewportRef!: ElementRef<HTMLDivElement>;

  @ViewChild('fieldWrapper', { static: true })
  private readonly fieldWrapperRef!: ElementRef<HTMLDivElement>;

  readonly zoom = signal(1);
  readonly pan = signal({ x: 0, y: 0 });
  readonly isPanning = signal(false);

  readonly transformStyle = computed(() => {
    const { x, y } = this.pan();
    const zoom = this.zoom();
    return `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
  });

  private pointerId: number | null = null;
  private dragOrigin: {
    x: number;
    y: number;
    panX: number;
    panY: number;
    started: boolean;
    isOnCell: boolean;
  } | null = null;
  private activePointers = new Map<number, { x: number; y: number }>();
  private pinchState: {
    distance: number;
    zoom: number;
    panX: number;
    panY: number;
    worldX: number;
    worldY: number;
  } | null = null;
  private fitFrameId: number | null = null;
  private globalListenersAbortController: AbortController | null = null;
  private readonly globalPointerUpHandler = (event: PointerEvent) => {
    if (this.pointerId === null && this.activePointers.size === 0) {
      return;
    }
    this.onPointerUp(event);
  };

  ngOnInit() {
    this.globalListenersAbortController = new AbortController();
    const signal = this.globalListenersAbortController.signal;

    window.addEventListener('pointerup', this.globalPointerUpHandler, { signal });
    window.addEventListener('pointercancel', this.globalPointerUpHandler, { signal });
  }

  ngOnDestroy() {
    this.globalListenersAbortController?.abort();
    this.globalListenersAbortController = null;
  }

  onPointerDown(event: PointerEvent) {
    const isTouch = event.pointerType === 'touch';
    if (!isTouch && (event.button !== 0 || this.pointerId !== null)) {
      return;
    }
    if (isTouch && event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    const cellTarget = target?.closest?.('.minesweeper-cell') as HTMLElement | null;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.activePointers.size === 2) {
      this.startPinch();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      this.pointerId = null;
      this.dragOrigin = null;
      this.isPanning.set(false);
      return;
    }
    this.pointerId = event.pointerId;
    const { x, y } = this.pan();
    this.dragOrigin = {
      x: event.clientX,
      y: event.clientY,
      panX: x,
      panY: y,
      started: false,
      isOnCell: !!cellTarget,
    };
  }

  onPointerMove(event: PointerEvent) {
    if (this.activePointers.has(event.pointerId)) {
      this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.activePointers.size === 2) {
        this.updatePinch(event);
        return;
      }
    }
    if (this.pointerId !== event.pointerId || !this.dragOrigin) {
      return;
    }

    const deltaX = event.clientX - this.dragOrigin.x;
    const deltaY = event.clientY - this.dragOrigin.y;
    const effectiveThreshold = this.dragOrigin.isOnCell ? PAN_THRESHOLD_PX * 2 : PAN_THRESHOLD_PX;
    const movedEnough =
      Math.abs(deltaX) >= effectiveThreshold || Math.abs(deltaY) >= effectiveThreshold;

    if (movedEnough && !this.dragOrigin.started) {
      this.dragOrigin.started = true;
      this.isPanning.set(true);
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    if (!this.dragOrigin.started) {
      return;
    }

    event.preventDefault();
    this.pan.set({
      x: this.dragOrigin.panX + deltaX,
      y: this.dragOrigin.panY + deltaY,
    });
  }

  onPointerUp(event: PointerEvent) {
    this.activePointers.delete(event.pointerId);
    if (this.activePointers.size < 2) {
      this.pinchState = null;
    }
    if (this.pointerId !== event.pointerId) {
      return;
    }

    if (this.dragOrigin?.started) {
      event.preventDefault();
    }

    const viewport = this.viewportRef?.nativeElement;
    const hasPointerCapture =
      viewport &&
      'hasPointerCapture' in viewport &&
      typeof viewport.hasPointerCapture === 'function';
    if (hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    this.pointerId = null;
    this.dragOrigin = null;
    this.isPanning.set(false);
  }

  onWheel(event: WheelEvent) {
    if (!event.deltaY) {
      return;
    }
    event.preventDefault();
    const zoomFactor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
    this.zoomAtPoint(event.clientX, event.clientY, zoomFactor);
  }

  fitToViewport() {
    const viewport = this.viewportRef.nativeElement;
    const field = this.fieldWrapperRef.nativeElement;

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const fieldWidth = field.offsetWidth;
    const fieldHeight = field.offsetHeight;

    if (!viewportWidth || !viewportHeight || !fieldWidth || !fieldHeight) {
      return;
    }

    const fitZoom =
      clamp(
        Math.min(viewportWidth / fieldWidth, viewportHeight / fieldHeight),
        MIN_ZOOM,
        MAX_ZOOM,
      ) - 0.2;
    this.zoom.set(fitZoom);

    const scaledWidth = fieldWidth * fitZoom;
    const scaledHeight = fieldHeight * fitZoom;
    this.pan.set({
      x: (viewportWidth - scaledWidth) / 2,
      y: (viewportHeight - scaledHeight) / 2,
    });
  }

  scheduleFit() {
    if (this.fitFrameId !== null) {
      cancelAnimationFrame(this.fitFrameId);
    }
    this.fitFrameId = requestAnimationFrame(() => {
      this.fitFrameId = null;
      this.fitToViewport();
    });
  }

  private setZoom(nextZoom: number) {
    this.zoom.set(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM));
  }

  private startPinch() {
    const pointers = Array.from(this.activePointers.values());
    if (pointers.length !== 2) {
      return;
    }
    const [p1, p2] = pointers;
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const { x: panX, y: panY } = this.pan();
    const zoom = this.zoom();
    const worldX = (mid.x - panX) / zoom;
    const worldY = (mid.y - panY) / zoom;
    this.pinchState = { distance, zoom, panX, panY, worldX, worldY };
    this.dragOrigin = null;
    this.isPanning.set(false);
  }

  private updatePinch(event: PointerEvent) {
    if (!this.pinchState) {
      this.startPinch();
      return;
    }
    const pointers = Array.from(this.activePointers.values());
    if (pointers.length !== 2) {
      return;
    }
    event.preventDefault();
    const [p1, p2] = pointers;
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const scale = distance / this.pinchState.distance;
    const nextZoom = clamp(this.pinchState.zoom * scale, MIN_ZOOM, MAX_ZOOM);
    const nextPanX = mid.x - this.pinchState.worldX * nextZoom;
    const nextPanY = mid.y - this.pinchState.worldY * nextZoom;
    this.zoom.set(nextZoom);
    this.pan.set({ x: nextPanX, y: nextPanY });
  }

  private zoomAtPoint(clientX: number, clientY: number, zoomFactor: number) {
    const viewport = this.viewportRef.nativeElement;
    const rect = viewport.getBoundingClientRect();
    const pointX = clientX - rect.left;
    const pointY = clientY - rect.top;
    const { x: panX, y: panY } = this.pan();
    const currentZoom = this.zoom();
    const nextZoom = clamp(currentZoom * zoomFactor, MIN_ZOOM, MAX_ZOOM);
    const worldX = (pointX - panX) / currentZoom;
    const worldY = (pointY - panY) / currentZoom;
    this.zoom.set(nextZoom);
    this.pan.set({
      x: pointX - worldX * nextZoom,
      y: pointY - worldY * nextZoom,
    });
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
