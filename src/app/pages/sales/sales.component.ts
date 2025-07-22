import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
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
  soldItems$: Observable<Item[]> = of([]);
  fairTotal$: Observable<number> = of(0);
  currentFair: Fair | null = null;

  constructor(
    private inventoryService: InventoryService,
    private fairService: FairService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('📊 Sales page loading...');
    const fairId = this.route.snapshot.queryParams['fairId'];
    
    if (fairId) {
      // Show sales for specific fair
      console.log('📊 Loading sales for specific fair:', fairId);
      this.currentFair = this.fairService.getFairById(fairId);
      this.loadSalesForFair(fairId);
    } else {
      // Show sales for active fair
      console.log('📊 Loading sales for active fair');
      this.fairService.activeFair$.subscribe(fair => {
        this.currentFair = fair;
        if (fair) {
          this.loadSalesForFair(fair._id!);
        } else {
          console.log('📊 No active fair found');
          this.soldItems$ = of([]);
          this.fairTotal$ = of(0);
        }
      });
    }
  }

  private loadSalesForFair(fairId: string) {
    console.log('📊 Loading sales data for fair:', fairId);
    this.soldItems$ = this.inventoryService.getSoldItemsForFair(fairId);
    this.fairTotal$ = this.inventoryService.getFairTotal(fairId);
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