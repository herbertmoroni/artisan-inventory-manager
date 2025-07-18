import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Fair } from '../../models/fair';
import { FairService } from '../../services/fair.service';

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

  constructor(
    private fairService: FairService,
    private router: Router
  ) {
    this.fairs$ = this.fairService.getFairs();
  }

  ngOnInit() {
    this.fairService.activeFair$.subscribe(fair => {
      this.activeFair = fair;
    });
  }

  onAddFair() {
    this.router.navigate(['/fair-form']);
  }

  onEditFair(fair: Fair) {
    this.router.navigate(['/fair-form', fair._id]);
  }

  onStartFair(fair: Fair) {
    this.fairService.startFair(fair._id!);
  }

  onEndFair() {
    this.fairService.endFair();
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
}