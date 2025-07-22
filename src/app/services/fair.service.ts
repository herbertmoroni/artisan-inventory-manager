import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Fair } from '../models/fair';

@Injectable({
  providedIn: 'root'
})
export class FairService {
  private fairsSubject = new BehaviorSubject<Fair[]>([]);
  public fairs$ = this.fairsSubject.asObservable();
  
  private activeFairSubject = new BehaviorSubject<Fair | null>(null);
  public activeFair$ = this.activeFairSubject.asObservable();

  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
    this.loadFairs();
    this.loadActiveFair();
  }

  // Load all fairs from API
  private async loadFairs() {
    try {
      const fairs = await this.http.get<Fair[]>(`${this.API_URL}/fairs`).toPromise();
      console.log('✅ Loaded fairs from API:', fairs);
      this.fairsSubject.next(fairs || []);
    } catch (error) {
      console.error('❌ Failed to load fairs:', error);
      alert('Failed to load fairs. Please check if server is running on localhost:3000');
      this.fairsSubject.next([]);
    }
  }

  // Load active fair from API
  private async loadActiveFair() {
    try {
      const activeFair = await this.http.get<Fair>(`${this.API_URL}/fairs/active/current`).toPromise();
      console.log('✅ Loaded active fair:', activeFair);
      this.activeFairSubject.next(activeFair || null);
    } catch (error) {
      console.error('❌ Failed to load active fair:', error);
      this.activeFairSubject.next(null);
    }
  }

  getFairs(): Observable<Fair[]> {
    return this.fairs$;
  }

  // Add new fair
  async addFair(fair: Fair): Promise<void> {
    try {
      console.log('➕ Adding fair to API:', fair);
      const newFair = await this.http.post<Fair>(`${this.API_URL}/fairs`, fair).toPromise();
      console.log('✅ Fair added successfully:', newFair);
      
      // Update local state
      const currentFairs = this.fairsSubject.value;
      this.fairsSubject.next([...currentFairs, newFair!]);
      
    } catch (error) {
      console.error('❌ Failed to add fair:', error);
      alert('Failed to add fair. Please try again.');
      throw error;
    }
  }

  // Update existing fair
  async updateFair(updatedFair: Fair): Promise<void> {
    try {
      console.log('✏️ Updating fair via API:', updatedFair);
      const updated = await this.http.put<Fair>(`${this.API_URL}/fairs/${updatedFair._id}`, updatedFair).toPromise();
      console.log('✅ Fair updated successfully:', updated);
      
      // Update local state
      const currentFairs = this.fairsSubject.value;
      const index = currentFairs.findIndex(fair => fair._id === updatedFair._id);
      if (index !== -1) {
        currentFairs[index] = updated!;
        this.fairsSubject.next([...currentFairs]);
      }
      
    } catch (error) {
      console.error('❌ Failed to update fair:', error);
      alert('Failed to update fair. Please try again.');
      throw error;
    }
  }

  // Delete fair
  async deleteFair(fairId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting fair via API:', fairId);
      await this.http.delete(`${this.API_URL}/fairs/${fairId}`).toPromise();
      console.log('✅ Fair deleted successfully');
      
      // Update local state
      const currentFairs = this.fairsSubject.value;
      const filteredFairs = currentFairs.filter(fair => fair._id !== fairId);
      this.fairsSubject.next(filteredFairs);
      
      // If deleted fair was active, clear active fair
      const activeFair = this.activeFairSubject.value;
      if (activeFair && activeFair._id === fairId) {
        this.activeFairSubject.next(null);
      }
      
    } catch (error) {
      console.error('❌ Failed to delete fair:', error);
      alert('Failed to delete fair. Please try again.');
      throw error;
    }
  }

  // Start fair (make it active)
  async startFair(fairId: string): Promise<void> {
    try {
      console.log('▶️ Starting fair via API:', fairId);
      const response = await this.http.post<any>(`${this.API_URL}/fairs/${fairId}/start`, {}).toPromise();
      console.log('✅ Fair started successfully:', response);
      
      // Update local state - deactivate all fairs, then activate the selected one
      const currentFairs = this.fairsSubject.value;
      currentFairs.forEach(fair => fair.active = false);
      
      const targetFair = currentFairs.find(f => f._id === fairId);
      if (targetFair) {
        targetFair.active = true;
        this.activeFairSubject.next(targetFair);
      }
      
      this.fairsSubject.next([...currentFairs]);
      
    } catch (error) {
      console.error('❌ Failed to start fair:', error);
      alert('Failed to start fair. Please try again.');
      throw error;
    }
  }

  // End active fair
  async endFair(): Promise<void> {
    try {
      console.log('⏹️ Ending active fair via API');
      const response = await this.http.post<any>(`${this.API_URL}/fairs/end`, {}).toPromise();
      console.log('✅ Fair ended successfully:', response);
      
      // Update local state
      const currentFairs = this.fairsSubject.value;
      currentFairs.forEach(fair => fair.active = false);
      this.fairsSubject.next([...currentFairs]);
      this.activeFairSubject.next(null);
      
    } catch (error) {
      console.error('❌ Failed to end fair:', error);
      alert('Failed to end fair. Please try again.');
      throw error;
    }
  }

  // Get currently active fair
  getActiveFair(): Fair | null {
    return this.activeFairSubject.value;
  }

  // Get fair by ID
  getFairById(fairId: string): Fair | null {
    return this.fairsSubject.value.find(fair => fair._id === fairId) || null;
  }

  // Refresh fairs from server (useful after operations)
  async refreshFairs(): Promise<void> {
    await this.loadFairs();
    await this.loadActiveFair();
  }
}