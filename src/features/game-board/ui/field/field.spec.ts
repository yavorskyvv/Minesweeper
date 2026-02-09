import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FieldComponent } from './field';

describe('FieldComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FieldComponent],
    });
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(FieldComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
