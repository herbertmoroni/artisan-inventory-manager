import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Fair } from '../../models/fair';
import { FairService } from '../../services/fair.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-fairs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fairs.component.html',
  styleUrls: ['./fairs.component.css']
})
export class FairsComponent implements OnInit {
  fairs$: Observable<Fair[]>;
  activeFair: Fair | null = null;
  isLoading = false;
  fairOperations: { [key: string]: boolean } = {}; // Track loading per fair
  fairTotals: { [key: string]: Observable<number> } = {}; // Cache totals

  constructor(
    private fairService: FairService,
    private inventoryService: InventoryService,
    private router: Router
  ) {
    this.fairs$ = this.fairService.getFairs();
  }

  ngOnInit() {
    console.log('🎪 Fairs page loading...');
    this.fairService.activeFair$.subscribe(fair => {
      this.activeFair = fair;
    });

    // Load fair totals once when fairs are loaded
    this.fairs$.subscribe(fairs => {
      fairs.forEach(fair => {
        if (fair._id && !this.fairTotals[fair._id]) {
          this.fairTotals[fair._id] = this.inventoryService.getFairTotal(fair._id);
        }
      });
    });
  }

  onAddFair() {
    this.router.navigate(['/fair-form']);
  }

  onEditFair(fair: Fair) {
    this.router.navigate(['/fair-form', fair._id]);
  }

  async onStartFair(fair: Fair) {
    if (this.fairOperations[fair._id!]) return; // Prevent double-click
    
    this.fairOperations[fair._id!] = true;
    try {
      await this.fairService.startFair(fair._id!);
      console.log('✅ Fair started:', fair.name);
    } catch (error) {
      console.error('❌ Failed to start fair:', error);
    } finally {
      this.fairOperations[fair._id!] = false;
    }
  }

  async onEndFair() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    try {
      await this.fairService.endFair();
      console.log('✅ Fair ended');
    } catch (error) {
      console.error('❌ Failed to end fair:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onViewSales(fair: Fair) {
    this.router.navigate(['/sales'], { queryParams: { fairId: fair._id } });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  isSameDay(startDate: Date, endDate: Date): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start.toDateString() === end.toDateString();
  }

  // Fixed: Return cached Observable instead of creating new one each time
  getFairTotal(fairId: string): Observable<number> {
    return this.fairTotals[fairId] || of(0);
  }

  // Helper methods for button states
  isFairLoading(fairId: string): boolean {
    return !!this.fairOperations[fairId];
  }

  getStartButtonText(fair: Fair): string {
    return this.isFairLoading(fair._id!) ? 'Starting...' : '▶️ Start';
  }

  getEndButtonText(): string {
    return this.isLoading ? 'Ending...' : '⏹️ End';
  }
}