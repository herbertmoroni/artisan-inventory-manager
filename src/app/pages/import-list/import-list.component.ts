import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Item } from '../../models/item';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-import-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-list.component.html',
  styleUrls: ['./import-list.component.css']  
})
export class ImportListComponent implements OnInit {
  importItems$: Observable<Item[]>;
  showClearConfirmation = false;
  isClearing = false; // Loading state for clear operation

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {
    this.importItems$ = this.inventoryService.getImportList();
  }

  ngOnInit() {
    console.log('📦 Import List page loading...');
  }

  onEditItem(item: Item) {
    this.router.navigate(['/item-form', item._id], { 
      queryParams: { returnUrl: '/import' } 
    });
  }

  onClearAll() {
    this.showClearConfirmation = true;
  }

  async onConfirmClearAll() {
    if (this.isClearing) return; // Prevent double-click
    
    this.isClearing = true;
    this.showClearConfirmation = false;
    
    try {
      console.log('🧹 Clearing import list...');
      await this.inventoryService.clearImportList();
      console.log('✅ Import list cleared successfully!');
    } catch (error) {
      console.error('❌ Failed to clear import list:', error);
      // Error already shown by service
    } finally {
      this.isClearing = false;
    }
  }

  onCancelClear() {
    this.showClearConfirmation = false;
  }
}