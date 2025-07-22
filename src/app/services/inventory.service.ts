import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Item, ItemCategory } from '../models/item';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  public items$ = this.itemsSubject.asObservable();
  
  // Remove sales subject - we'll get sales from API instead
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
    this.loadItems();
  }

  // PHASE 1: Replace this method with HTTP call
  private async loadItems() {
    try {
      const items = await this.http.get<Item[]>(`${this.API_URL}/items`).toPromise();
      console.log('✅ Loaded items from API:', items);
      this.itemsSubject.next(items || []);
    } catch (error) {
      console.error('❌ Failed to load items:', error);
      alert('Failed to load items. Please check if server is running on localhost:3000');
      // Fallback to empty array
      this.itemsSubject.next([]);
    }
  }

  getItems(): Observable<Item[]> {
    return this.items$;
  }

  // PHASE 1: Keep client-side filtering for now
  filterItems(searchTerm: string, category?: ItemCategory): Observable<Item[]> {
    return this.items$.pipe(
      map(items => {
        let filteredItems = items;
        
        if (category) {
          filteredItems = filteredItems.filter(item => item.category === category);
        }
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
          );
        }
        
        return filteredItems;
      })
    );
  }

  // PHASE 2a: Add item with HTTP call
  async addItem(item: Item): Promise<void> {
    try {
      console.log('➕ Adding item to API:', item);
      const newItem = await this.http.post<Item>(`${this.API_URL}/items`, item).toPromise();
      console.log('✅ Item added successfully:', newItem);
      
      // Update local state
      const currentItems = this.itemsSubject.value;
      this.itemsSubject.next([...currentItems, newItem!]);
      
    } catch (error) {
      console.error('❌ Failed to add item:', error);
      alert('Failed to add item. Please try again.');
      throw error; // Let component handle it
    }
  }

  // PHASE 2b: Update item with HTTP call
  async updateItem(updatedItem: Item): Promise<void> {
    try {
      console.log('✏️ Updating item via API:', updatedItem);
      const updated = await this.http.put<Item>(`${this.API_URL}/items/${updatedItem._id}`, updatedItem).toPromise();
      console.log('✅ Item updated successfully:', updated);
      
      // Update local state
      const currentItems = this.itemsSubject.value;
      const index = currentItems.findIndex(item => item._id === updatedItem._id);
      if (index !== -1) {
        currentItems[index] = updated!;
        this.itemsSubject.next([...currentItems]);
      }
      
    } catch (error) {
      console.error('❌ Failed to update item:', error);
      alert('Failed to update item. Please try again.');
      throw error;
    }
  }

  // PHASE 2c: Sell item with HTTP call
  async sellItem(itemId: string, fairId?: string): Promise<void> {
    try {
      console.log('🛒 Selling item via API:', itemId, fairId);
      const response = await this.http.post<any>(`${this.API_URL}/items/${itemId}/sell`, { fairId }).toPromise();
      console.log('✅ Item sold successfully:', response);
      
      // Update local state - decrease quantity
      const currentItems = this.itemsSubject.value;
      const item = currentItems.find(item => item._id === itemId);
      if (item) {
        item.quantity = response.remainingQuantity;
        this.itemsSubject.next([...currentItems]);
      }
      
    } catch (error) {
      console.error('❌ Failed to sell item:', error);
      alert('Failed to sell item. Please try again.');
      throw error;
    }
  }

  // PHASE 2d: Delete item with HTTP call
  async deleteItem(itemId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting item via API:', itemId);
      await this.http.delete(`${this.API_URL}/items/${itemId}`).toPromise();
      console.log('✅ Item deleted successfully');
      
      // Update local state
      const currentItems = this.itemsSubject.value;
      const filteredItems = currentItems.filter(item => item._id !== itemId);
      this.itemsSubject.next(filteredItems);
      
    } catch (error) {
      console.error('❌ Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
      throw error;
    }
  }

  getImportList(): Observable<Item[]> {
    return this.items$.pipe(
      map(items => items.filter(item => item.nextImport))
    );
  }

  clearImportList(): void {
    const currentItems = this.itemsSubject.value;
    const updatedItems = currentItems.map(item => ({
      ...item,
      nextImport: false
    }));
    this.itemsSubject.next(updatedItems);
    console.log('📝 Mock clearImportList called - will be updated in Phase 2');
  }

  // PHASE 3: Sales integration - Get sold items for a specific fair
  getSoldItemsForFair(fairId: string): Observable<Item[]> {
    return this.http.get<any[]>(`${this.API_URL}/fairs/${fairId}/sales`).pipe(
      map(sales => {
        console.log('📊 Raw sales data from API:', sales);
        // Convert sales records to Item format for compatibility
        return sales.map(sale => ({
          _id: sale._id,
          name: sale.itemName,
          category: sale.category,
          description: '',
          color: '',
          price: sale.price,
          quantity: 1, // Each sale record represents 1 sold item
          image: '',
          nextImport: false,
          dateAdded: new Date(sale.saleDate),
          soldAt: {
            date: new Date(sale.saleDate),
            fairId: sale.fairId
          }
        } as Item));
      }),
      catchError(error => {
        console.error('❌ Failed to get fair sales:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  // PHASE 3: Sales integration - Get fair total from API
  getFairTotal(fairId: string): Observable<number> {
    return this.http.get<{total: number}>(`${this.API_URL}/fairs/${fairId}/total`).pipe(
      map(response => {
        console.log('💰 Fair total from API:', response);
        return response.total || 0;
      }),
      catchError(error => {
        console.error('❌ Failed to get fair total:', error);
        return of(0); // Return 0 on error
      })
    );
  }
}