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
  
  private salesSubject = new BehaviorSubject<Item[]>([]);
  public sales$ = this.salesSubject.asObservable();

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

  // TEMPORARY: Keep these methods as mock data for Phase 1
  // We'll update these in Phase 2
  addItem(item: Item): void {
    const currentItems = this.itemsSubject.value;
    const newItem = {
      ...item,
      _id: Date.now().toString(),
      dateAdded: new Date()
    };
    this.itemsSubject.next([...currentItems, newItem]);
    console.log('📝 Mock addItem called - will be updated in Phase 2');
  }

  updateItem(updatedItem: Item): void {
    const currentItems = this.itemsSubject.value;
    const index = currentItems.findIndex(item => item._id === updatedItem._id);
    if (index !== -1) {
      currentItems[index] = updatedItem;
      this.itemsSubject.next([...currentItems]);
    }
    console.log('📝 Mock updateItem called - will be updated in Phase 2');
  }

  sellItem(itemId: string, fairId?: string): void {
    const currentItems = this.itemsSubject.value;
    const item = currentItems.find(item => item._id === itemId);
    if (item && item.quantity > 0) {
      item.quantity -= 1;
      
      // Create sale record
      const saleItem: Item = {
        ...item,
        _id: Date.now().toString() + '_sale',
        soldAt: {
          date: new Date(),
          fairId: fairId || ''
        }
      };
      
      const currentSales = this.salesSubject.value;
      this.salesSubject.next([...currentSales, saleItem]);
      this.itemsSubject.next([...currentItems]);
    }
    console.log('📝 Mock sellItem called - will be updated in Phase 2');
  }

  deleteItem(itemId: string): void {
    const currentItems = this.itemsSubject.value;
    const filteredItems = currentItems.filter(item => item._id !== itemId);
    this.itemsSubject.next(filteredItems);
    console.log('📝 Mock deleteItem called - will be updated in Phase 2');
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

  getSoldItemsForFair(fairId: string): Observable<Item[]> {
    return this.sales$.pipe(
      map(sales => sales.filter(sale => 
        sale.soldAt && sale.soldAt.fairId === fairId
      ))
    );
  }

  getFairTotal(fairId: string): Observable<number> {
    return this.getSoldItemsForFair(fairId).pipe(
      map(soldItems => soldItems.reduce((sum, item) => sum + item.price, 0))
    );
  }
}