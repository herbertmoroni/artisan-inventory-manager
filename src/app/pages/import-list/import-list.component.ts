import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private inventoryService: InventoryService) {
    this.importItems$ = this.inventoryService.getImportList();
  }

  ngOnInit() {}

  onEditItem(item: Item) {
    console.log('Edit import item:', item);
  }

  removeFromImportList(item: Item) {
    const updatedItem = { ...item, nextImport: false };
    this.inventoryService.updateItem(updatedItem);
  }
}