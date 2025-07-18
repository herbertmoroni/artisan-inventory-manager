import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css']
})
export class ItemCardComponent {
  @Input() item!: Item;
  @Output() sellItem = new EventEmitter<Item>();
  @Output() editItem = new EventEmitter<Item>();

  onSell() {
    if (this.item.quantity > 0) {
      this.sellItem.emit(this.item);
    }
  }

  onEdit() {
    this.editItem.emit(this.item);
  }

  get stockStatus(): string {
    if (this.item.quantity === 0) return 'Sold Out';
    if (this.item.quantity === 1) return 'Low Stock';
    return 'In Stock';
  }

  get stockColor(): string {
    if (this.item.quantity === 0) return 'var(--danger)';
    if (this.item.quantity === 1) return 'var(--warning)';
    return 'var(--success)';
  }
}
