import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BeerCalculatorService {

  constructor() { }

  getGravity(originalGravity: number, alcoholPercentage: number) {
    if (originalGravity > 2) {
      originalGravity = originalGravity / 100;
    }
    if (alcoholPercentage > 1) {
      alcoholPercentage = alcoholPercentage / 100;
    }
    const finalGravity = originalGravity - 40 * alcoholPercentage / 131;
    return 1.198 * finalGravity + 0.7905 * alcoholPercentage + 1 * (1 - finalGravity - alcoholPercentage);
  }
}
