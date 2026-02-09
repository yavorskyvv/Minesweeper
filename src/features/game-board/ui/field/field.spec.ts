import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FieldComponent } from './field';

describe('FieldComponent', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FieldComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(FieldComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
