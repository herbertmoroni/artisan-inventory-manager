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

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {
    this.importItems$ = this.inventoryService.getImportList();
  }

  ngOnInit() {}

  onEditItem(item: Item) {
    this.router.navigate(['/item-form', item._id], { 
      queryParams: { returnUrl: '/import' } 
    });
  }

  onClearAll() {
    this.showClearConfirmation = true;
  }

  onConfirmClearAll() {
    this.inventoryService.clearImportList();
    this.showClearConfirmation = false;
  }

  onCancelClear() {
    this.showClearConfirmation = false;
  }
}