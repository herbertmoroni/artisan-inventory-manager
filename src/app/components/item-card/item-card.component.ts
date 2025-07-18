import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item';
import { FairService } from '../../services/fair.service';
import { Fair } from '../../models/fair';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css']  
})
export class ItemCardComponent implements OnInit {
  @Input() item!: Item;
  @Output() sellItem = new EventEmitter<Item>();
  @Output() editItem = new EventEmitter<Item>();
  
  showConfirmation = false;
  activeFair: Fair | null = null;

  constructor(private fairService: FairService) {}

  ngOnInit() {
    this.fairService.activeFair$.subscribe(fair => {
      this.activeFair = fair;
    });
  }

  onSell() {
    if (this.item.quantity > 0) {
      this.showConfirmation = true;
    }
  }

  onConfirmSell() {
    this.sellItem.emit(this.item);
    this.showConfirmation = false;
  }

  onCancelSell() {
    this.showConfirmation = false;
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