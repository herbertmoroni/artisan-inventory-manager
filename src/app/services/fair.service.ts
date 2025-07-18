import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fair } from '../models/fair';

@Injectable({
  providedIn: 'root'
})
export class FairService {
  private activeFairSubject = new BehaviorSubject<Fair | null>(null);
  public activeFair$ = this.activeFairSubject.asObservable();

  constructor() {}

  startFair(fair: Fair): void {
    const newFair = {
      ...fair,
      _id: Date.now().toString(),
      active: true,
      createdAt: new Date()
    };
    this.activeFairSubject.next(newFair);
  }

  endFair(): void {
    const currentFair = this.activeFairSubject.value;
    if (currentFair) {
      currentFair.active = false;
      currentFair.endDate = new Date();
    }
    this.activeFairSubject.next(null);
  }

  getActiveFair(): Fair | null {
    return this.activeFairSubject.value;
  }
}
