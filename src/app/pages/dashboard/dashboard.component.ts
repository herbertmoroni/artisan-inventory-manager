import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Item, ItemCategory } from '../../models/item';
import { InventoryService } from '../../services/inventory.service';
import { FairService } from '../../services/fair.service';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { ItemFormComponent } from '../../components/item-form/item-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, ItemFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  items$: Observable<Item[]>;
  filteredItems$: Observable<Item[]>;
  searchTerm = '';
  selectedCategory: ItemCategory | null = null;
  showAddModal = false;
  activeFair: any = null; // Changed from Observable to simple property

  categories = [
    { value: null, label: 'All' },
    { value: ItemCategory.EARRINGS, label: 'Earrings' },
    { value: ItemCategory.BRACELETS, label: 'Bracelets' },
    { value: ItemCategory.NECKLACES, label: 'Necklaces' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private fairService: FairService
  ) {
    this.items$ = this.inventoryService.getItems();
    this.filteredItems$ = this.items$;
  }

  ngOnInit() {
    this.applyFilters();
    // Subscribe to fair changes
    this.fairService.activeFair$.subscribe(fair => {
      this.activeFair = fair;
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  onCategoryFilter(category: ItemCategory | null) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredItems$ = this.inventoryService.filterItems(this.searchTerm, this.selectedCategory || undefined);
  }

  onSellItem(item: Item) {
    const activeFair = this.fairService.getActiveFair();
    this.inventoryService.sellItem(item._id!, activeFair?._id);
  }

  onEditItem(item: Item) {
    console.log('Edit item:', item);
  }

  onAddItem() {
    this.showAddModal = true;
  }

  onSaveItem(item: Item) {
    this.inventoryService.addItem(item);
    this.showAddModal = false;
  }

  onCancelAdd() {
    this.showAddModal = false;
  }

  onStartFair() {
    this.fairService.startFair({
      name: 'Current Fair',
      startDate: new Date(),
      endDate: new Date(),
      active: true,
      createdAt: new Date()
    });
  }

  onEndFair() {
    this.fairService.endFair();
  }

  // Helper method for template
  get fairButtonText(): string {
    return this.activeFair ? '⏹️ End Fair' : '▶️ Start Fair';
  }

  get fairButtonClass(): string {
    return this.activeFair ? 'btn-warning' : 'btn-success';
  }

  onFairButtonClick() {
    if (this.activeFair) {
      this.onEndFair();
    } else {
      this.onStartFair();
    }
  }
}