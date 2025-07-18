import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Fair } from '../../models/fair';
import { FairService } from '../../services/fair.service';

@Component({
  selector: 'app-fair-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fair-form.component.html',
  styleUrls: ['./fair-form.component.css']
})
export class FairFormComponent implements OnInit {
  fairForm: FormGroup;
  pageTitle = 'Add Fair';
  isEditMode = false;
  currentFair: Fair | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private fairService: FairService
  ) {
    this.fairForm = this.createForm();
  }

  ngOnInit() {
    const fairId = this.route.snapshot.paramMap.get('id');
    
    if (fairId) {
      this.isEditMode = true;
      this.pageTitle = 'Edit Fair';
      this.loadFair(fairId);
    } else {
      this.isEditMode = false;
      this.pageTitle = 'Add Fair';
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      isOneDay: [false]
    });
  }

  private loadFair(fairId: string) {
    this.fairService.getFairs().subscribe(fairs => {
      this.currentFair = fairs.find(fair => fair._id === fairId) || null;
      if (this.currentFair) {
        const startDate = new Date(this.currentFair.startDate).toISOString().split('T')[0];
        const endDate = new Date(this.currentFair.endDate).toISOString().split('T')[0];
        
        this.fairForm.patchValue({
          name: this.currentFair.name,
          city: this.currentFair.city,
          startDate: startDate,
          endDate: endDate,
          isOneDay: startDate === endDate
        });
      }
    });
  }

  onOneDayChange(event: any) {
    const isOneDay = event.target.checked;
    if (isOneDay) {
      const startDate = this.fairForm.get('startDate')?.value;
      if (startDate) {
        this.fairForm.patchValue({ endDate: startDate });
      }
    }
  }

  onStartDateChange(event: any) {
    const isOneDay = this.fairForm.get('isOneDay')?.value;
    if (isOneDay) {
      this.fairForm.patchValue({ endDate: event.target.value });
    }
  }

  onSubmit() {
    if (this.fairForm.valid) {
      const formValue = this.fairForm.value;
      const fair: Fair = {
        _id: this.currentFair?._id,
        name: formValue.name,
        city: formValue.city,
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        active: this.currentFair?.active || false,
        createdAt: this.currentFair?.createdAt || new Date()
      };

      if (this.isEditMode) {
        this.fairService.updateFair(fair);
      } else {
        this.fairService.addFair(fair);
      }

      this.goBack();
    }
  }

  onCancel() {
    this.goBack();
  }

  private goBack() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/fairs';
    this.router.navigate([returnUrl]);
  }
}