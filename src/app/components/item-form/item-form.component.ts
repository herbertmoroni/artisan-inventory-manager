import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item, ItemCategory } from '../../models/item';

@Component({
  selector: 'app-item-form',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent implements OnInit {
  @Input() item: Item | null = null;
  @Input() isVisible = false;
  @Output() save = new EventEmitter<Item>();
  @Output() cancel = new EventEmitter<void>();

  itemForm: FormGroup;
  photoPreview: string | null = null;
  categories = Object.values(ItemCategory);

  constructor(private fb: FormBuilder) {
    this.itemForm = this.createForm();
  }

  ngOnInit() {
    if (this.item) {
      this.itemForm.patchValue(this.item);
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
        _id: this.item?._id,
        image: this.photoPreview || this.item?.image,
        dateAdded: this.item?.dateAdded || new Date()
      };
      this.save.emit(item);
      this.resetForm();
    }
  }

  onCancel() {
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm() {
    this.itemForm.reset();
    this.photoPreview = null;
  }

  triggerCamera() {
    const fileInput = document.getElementById('cameraInput') as HTMLInputElement;
    fileInput?.click();
  }
}