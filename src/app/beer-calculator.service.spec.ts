import { TestBed } from '@angular/core/testing';

import { BeerCalculatorService } from './beer-calculator.service';

describe('BeerCalculatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BeerCalculatorService = TestBed.get(BeerCalculatorService);
    expect(service).toBeTruthy();
  });

  it('should calculate beer gravity', () => {
    const service: BeerCalculatorService = TestBed.get(BeerCalculatorService);
    expect(service.getGravity(12, 5)).toBeCloseTo(0.9, 0.1);
  });
});
