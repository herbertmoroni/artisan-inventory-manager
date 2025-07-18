import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item, ItemCategory } from '../models/item';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  public items$ = this.itemsSubject.asObservable();

  constructor() {
    // Initialize with mock data
    this.loadMockData();
  }

  private loadMockData() {
    const mockItems: Item[] = [
      {
        _id: '1',
        name: 'Silver Flower Earrings',
        category: ItemCategory.EARRINGS,
        description: 'Handmade silver with blue stone accents from Brazil',
        color: 'silver/blue',
        price: 25.00,
        quantity: 2,
        nextImport: false,
        dateAdded: new Date()
      },
      {
        _id: '2',
        name: 'Golden Grass Bracelet',
        category: ItemCategory.BRACELETS,
        description: 'Traditional Brazilian golden grass weave pattern',
        color: 'golden',
        price: 35.00,
        quantity: 1,
        nextImport: true,
        dateAdded: new Date()
      },
      {
        _id: '3',
        name: 'Colorful Beaded Necklace',
        category: ItemCategory.NECKLACES,
        description: 'Natural stones and colorful beads in traditional pattern',
        color: 'multicolor',
        price: 45.00,
        quantity: 3,
        nextImport: false,
        dateAdded: new Date()
      }
    ];
    this.itemsSubject.next(mockItems);
  }

  getItems(): Observable<Item[]> {
    return this.items$;
  }

  addItem(item: Item): void {
    const currentItems = this.itemsSubject.value;
    const newItem = {
      ...item,
      _id: Date.now().toString(),
      dateAdded: new Date()
    };
    this.itemsSubject.next([...currentItems, newItem]);
  }

  updateItem(updatedItem: Item): void {
    const currentItems = this.itemsSubject.value;
    const index = currentItems.findIndex(item => item._id === updatedItem._id);
    if (index !== -1) {
      currentItems[index] = updatedItem;
      this.itemsSubject.next([...currentItems]);
    }
  }

  sellItem(itemId: string, fairId?: string): void {
    const currentItems = this.itemsSubject.value;
    const item = currentItems.find(item => item._id === itemId);
    if (item && item.quantity > 0) {
      item.quantity -= 1;
      if (fairId) {
        item.soldAt = {
          date: new Date(),
          fairId: fairId
        };
      }
      this.itemsSubject.next([...currentItems]);
    }
  }

  deleteItem(itemId: string): void {
    const currentItems = this.itemsSubject.value;
    const filteredItems = currentItems.filter(item => item._id !== itemId);
    this.itemsSubject.next(filteredItems);
  }

  getImportList(): Observable<Item[]> {
    return new Observable(observer => {
      this.items$.subscribe(items => {
        const importItems = items.filter(item => item.nextImport);
        observer.next(importItems);
      });
    });
  }

  clearImportList(): void {
    const currentItems = this.itemsSubject.value;
    const updatedItems = currentItems.map(item => ({
      ...item,
      nextImport: false
    }));
    this.itemsSubject.next(updatedItems);
  }

  filterItems(searchTerm: string, category?: ItemCategory): Observable<Item[]> {
    return new Observable(observer => {
      this.items$.subscribe(items => {
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
        
        observer.next(filteredItems);
      });
    });
  }
}