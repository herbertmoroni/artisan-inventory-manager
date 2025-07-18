import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Fair } from '../models/fair';

@Injectable({
  providedIn: 'root'
})
export class FairService {
  private fairsSubject = new BehaviorSubject<Fair[]>([]);
  public fairs$ = this.fairsSubject.asObservable();
  
  private activeFairSubject = new BehaviorSubject<Fair | null>(null);
  public activeFair$ = this.activeFairSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    const mockFairs: Fair[] = [
      {
        _id: '1',
        name: 'Summer Art Festival',
        city: 'Denver',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-16'),
        active: false,
        createdAt: new Date('2024-06-01')
      },
      {
        _id: '2',
        name: 'Holiday Craft Market',
        city: 'Boulder',
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-22'),
        active: false,
        createdAt: new Date('2024-12-01')
      }
    ];
    this.fairsSubject.next(mockFairs);
  }

  getFairs(): Observable<Fair[]> {
    return this.fairs$;
  }

  addFair(fair: Fair): void {
    const currentFairs = this.fairsSubject.value;
    const newFair = {
      ...fair,
      _id: Date.now().toString(),
      active: false,
      createdAt: new Date()
    };
    this.fairsSubject.next([...currentFairs, newFair]);
  }

  updateFair(updatedFair: Fair): void {
    const currentFairs = this.fairsSubject.value;
    const index = currentFairs.findIndex(fair => fair._id === updatedFair._id);
    if (index !== -1) {
      currentFairs[index] = updatedFair;
      this.fairsSubject.next([...currentFairs]);
    }
  }

  deleteFair(fairId: string): void {
    const currentFairs = this.fairsSubject.value;
    const filteredFairs = currentFairs.filter(fair => fair._id !== fairId);
    this.fairsSubject.next(filteredFairs);
  }

  startFair(fairId: string): void {
    const currentFairs = this.fairsSubject.value;
    
    // Deactivate all fairs first
    currentFairs.forEach(fair => fair.active = false);
    
    // Activate the selected fair
    const fair = currentFairs.find(f => f._id === fairId);
    if (fair) {
      fair.active = true;
      this.activeFairSubject.next(fair);
    }
    
    this.fairsSubject.next([...currentFairs]);
  }

  endFair(): void {
    const currentFairs = this.fairsSubject.value;
    const activeFair = currentFairs.find(fair => fair.active);
    
    if (activeFair) {
      activeFair.active = false;
      this.fairsSubject.next([...currentFairs]);
    }
    
    this.activeFairSubject.next(null);
  }

  getActiveFair(): Fair | null {
    return this.activeFairSubject.value;
  }

  getFairById(fairId: string): Fair | null {
    return this.fairsSubject.value.find(fair => fair._id === fairId) || null;
  }
}