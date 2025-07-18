import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Item, ItemCategory } from '../../models/item';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent implements OnInit {
  itemForm: FormGroup;
  photoPreview: string | null = null;
  categories = Object.values(ItemCategory);
  pageTitle = 'Add Item';
  isEditMode = false;
  currentItem: Item | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inventoryService: InventoryService
  ) {
    this.itemForm = this.createForm();
  }

  ngOnInit() {
    const itemId = this.route.snapshot.paramMap.get('id');
    
    if (itemId) {
      // Edit mode - load existing item
      this.isEditMode = true;
      this.pageTitle = 'Edit Item';
      this.loadItem(itemId);
    } else {
      // Add mode - empty form
      this.isEditMode = false;
      this.pageTitle = 'Add Item';
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      color: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      nextImport: [false]
    });
  }

  private loadItem(itemId: string) {
    this.inventoryService.getItems().subscribe(items => {
      this.currentItem = items.find(item => item._id === itemId) || null;
      if (this.currentItem) {
        this.itemForm.patchValue(this.currentItem);
        if (this.currentItem.image) {
          this.photoPreview = this.currentItem.image;
        }
      }
    });
  }

  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      const item: Item = {
        ...formValue,
        _id: this.currentItem?._id,
        image: this.photoPreview || this.currentItem?.image,
        dateAdded: this.currentItem?.dateAdded || new Date()
      };

      if (this.isEditMode) {
        this.inventoryService.updateItem(item);
      } else {
        this.inventoryService.addItem(item);
      }

      this.goBack();
    }
  }

  onCancel() {
    this.goBack();
  }

  private goBack() {
    // Check if we came from import page
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigate([returnUrl]);
  }

  triggerCamera() {
    const fileInput = document.getElementById('cameraInput') as HTMLInputElement;
    fileInput?.click();
  }
}