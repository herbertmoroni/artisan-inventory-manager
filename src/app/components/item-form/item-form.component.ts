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
  isSaving = false; 
  isDeleting = false; 
  showDeleteConfirmation = false; 

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
      // Compress image before converting to base64
      this.compressImage(file).then(compressedDataUrl => {
        this.photoPreview = compressedDataUrl;
        console.log('📸 Image compressed and ready');
      });
    }
  }

  // Simple image compression method
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Set max dimensions (adjust as needed)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.8 = 80% quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log(`📊 Original: ${file.size} bytes, Compressed: ~${Math.round(compressedDataUrl.length * 0.75)} bytes`);
        resolve(compressedDataUrl);
      };

      // Load the image
      img.src = URL.createObjectURL(file);
    });
  }

  // Updated with async/await and loading state
  async onSubmit() {
    if (this.itemForm.valid && !this.isSaving) {
      this.isSaving = true;
      
      // Disable form the Angular way
      this.itemForm.disable();
      
      try {
        const formValue = this.itemForm.getRawValue(); // Use getRawValue() to get disabled values too
        const item: Item = {
          ...formValue,
          _id: this.currentItem?._id,
          image: this.photoPreview || this.currentItem?.image,
          dateAdded: this.currentItem?.dateAdded || new Date()
        };

        console.log('💾 Submitting item:', item);

        if (this.isEditMode) {
          // HTTP call for updating
          await this.inventoryService.updateItem(item);
          console.log('✅ Item updated successfully!');
        } else {
          // HTTP call for adding
          await this.inventoryService.addItem(item);
          console.log('✅ Item added successfully!');
        }

        this.goBack();
        
      } catch (error) {
        console.error('❌ Failed to save item:', error);
        // Error already shown by service
      } finally {
        this.isSaving = false;
        // Re-enable form
        this.itemForm.enable();
      }
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

  // Delete functionality - only available in edit mode
  onDelete() {
    if (this.isEditMode && this.currentItem) {
      this.showDeleteConfirmation = true;
    }
  }

  async onConfirmDelete() {
    if (this.currentItem && !this.isDeleting) {
      this.isDeleting = true;
      this.showDeleteConfirmation = false;
      
      try {
        console.log('🗑️ Deleting item:', this.currentItem.name);
        await this.inventoryService.deleteItem(this.currentItem._id!);
        console.log('✅ Item deleted successfully!');
        this.goBack();
        
      } catch (error) {
        console.error('❌ Failed to delete item:', error);
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