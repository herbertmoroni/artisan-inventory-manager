import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Item, ItemCategory } from '../../models/item';
import { InventoryService } from '../../services/inventory.service';
import { FairService } from '../../services/fair.service';
import { ItemCardComponent } from '../../components/item-card/item-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ItemCardComponent],  
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  items$: Observable<Item[]>;
  filteredItems$: Observable<Item[]>;
  searchTerm = '';
  selectedCategory: ItemCategory | null = null;
  activeFair: any = null;

  categories = [
    { value: null, label: 'All' },
    { value: ItemCategory.EARRINGS, label: 'Earrings' },
    { value: ItemCategory.BRACELETS, label: 'Bracelets' },
    { value: ItemCategory.NECKLACES, label: 'Necklaces' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private fairService: FairService,
    private router: Router  
  ) {
    this.items$ = this.inventoryService.getItems();
    this.filteredItems$ = this.items$;
  }

  ngOnInit() {
    this.applyFilters();
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
    this.router.navigate(['/item-form', item._id]);  // Navigate to edit page
  }

  onAddItem() {
    this.router.navigate(['/item-form']);  // Navigate to add page
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