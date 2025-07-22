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
  isSaving = false;
  isDeleting = false;
  showDeleteConfirmation = false;

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

  async onSubmit() {
    if (this.fairForm.valid && !this.isSaving) {
      this.isSaving = true;
      this.fairForm.disable();
      
      try {
        const formValue = this.fairForm.getRawValue();
        const fair: Fair = {
          _id: this.currentFair?._id,
          name: formValue.name,
          city: formValue.city,
          startDate: new Date(formValue.startDate),
          endDate: new Date(formValue.endDate),
          active: this.currentFair?.active || false,
          createdAt: this.currentFair?.createdAt || new Date()
        };

        console.log('💾 Submitting fair:', fair);

        if (this.isEditMode) {
          await this.fairService.updateFair(fair);
          console.log('✅ Fair updated successfully!');
        } else {
          await this.fairService.addFair(fair);
          console.log('✅ Fair added successfully!');
        }

        this.goBack();
        
      } catch (error) {
        console.error('❌ Failed to save fair:', error);
        // Error already shown by service
      } finally {
        this.isSaving = false;
        this.fairForm.enable();
      }
    }
  }

  onCancel() {
    this.goBack();
  }

  private goBack() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/fairs';
    this.router.navigate([returnUrl]);
  }

  // Delete functionality - only available in edit mode
  onDelete() {
    if (this.isEditMode && this.currentFair) {
      this.showDeleteConfirmation = true;
    }
  }

  async onConfirmDelete() {
    if (this.currentFair && !this.isDeleting) {
      this.isDeleting = true;
      this.showDeleteConfirmation = false;
      
      try {
        console.log('🗑️ Deleting fair:', this.currentFair.name);
        await this.fairService.deleteFair(this.currentFair._id!);
        console.log('✅ Fair deleted successfully!');
        this.goBack();
        
      } catch (error) {
        console.error('❌ Failed to delete fair:', error);
        // Error already shown by service
      } finally {
        this.isDeleting = false;
      }
    }
  }

  onCancelDelete() {
    this.showDeleteConfirmation = false;
  }
}