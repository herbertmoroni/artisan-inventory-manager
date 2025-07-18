import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { Item } from '../../models/item';
import { Fair } from '../../models/fair';
import { InventoryService } from '../../services/inventory.service';
import { FairService } from '../../services/fair.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  soldItems$: Observable<Item[]>;
  currentFair: Fair | null = null;
  totalSales = 0;

  constructor(
    private inventoryService: InventoryService,
    private fairService: FairService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.soldItems$ = new Observable();
  }

  ngOnInit() {
    const fairId = this.route.snapshot.queryParams['fairId'];
    
    if (fairId) {
      // Show sales for specific fair
      this.currentFair = this.fairService.getFairById(fairId);
      this.loadSalesForFair(fairId);
    } else {
      // Show sales for active fair
      this.fairService.activeFair$.subscribe(fair => {
        this.currentFair = fair;
        if (fair) {
          this.loadSalesForFair(fair._id!);
        }
      });
    }
  }

  private loadSalesForFair(fairId: string) {
    this.soldItems$ = this.inventoryService.getSoldItemsForFair(fairId);
    
    this.soldItems$.subscribe(soldItems => {
      this.totalSales = soldItems.reduce((total, item) => total + item.price, 0);
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  goBack() {
    this.router.navigate(['/fairs']);
  }
}