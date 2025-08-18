import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CategoriesService } from '../../services/categories.service';
import { TransactionsService } from '../../services/transactions.service';
import { NotificationService } from '../../services/notification.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categorize-transaction-dialog',
  standalone: true,
  imports: [NgFor, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatDialogModule],
  templateUrl: './categorize-transaction-dialog.component.html',
  styleUrls: ['./categorize-transaction-dialog.component.scss']
})
export class CategorizeTransactionDialogComponent implements OnInit {
  categories: Category[] = [];
  subcategories: Category[] = [];
  selectedCategory: Category | null = null;
  selectedSubcategory: Category | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CategorizeTransactionDialogComponent>,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.categoriesService.getCategories().subscribe((cats) => {
      this.categories = cats;

      if (this.data.category?.parentCode) {
        this.selectedCategory = this.categories.find(c => c.code === this.data.category.parentCode) || null;
        this.filterSubcategories();
        this.selectedSubcategory = this.categories.find(c => c.code === this.data.category.code) || null;
      } else {
        this.selectedCategory = this.categories.find(c => c.code === this.data.category?.code) || null;
        this.filterSubcategories();
      }
    });
  }

  get categoriesWithoutParent() {
    return this.categories.filter(cat => !cat.parentCode);
  }

  filterSubcategories() {
    if (!this.selectedCategory) {
      this.subcategories = [];
      this.selectedSubcategory = null;
      return;
    }
    this.subcategories = this.categories.filter(cat => cat.parentCode === this.selectedCategory!.code);
    if (!this.subcategories.find(s => s.code === this.selectedSubcategory?.code)) {
      this.selectedSubcategory = null;
    }
  }

  apply() {
    const code = this.selectedSubcategory?.code || this.selectedCategory?.code;
    if (!code) return;

    const ids: number[] = this.data.ids ?? [this.data.id];
    this.transactionsService
      .categorizeMultiple(ids, code)
      .subscribe({
        next: (response) => {
          this.notificationService.handleSuccess(response, 'Transaction categorized.');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.notificationService.handleHttpError(error, 'An error occurred while categorizing the transaction.');
        }
      });
  }

}
