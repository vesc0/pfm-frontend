import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CategoriesService } from '../../services/categories.service';
import { TransactionsService } from '../../services/transactions.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-categorize-transaction-dialog',
  standalone: true,
  imports: [NgFor, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatDialogModule],
  templateUrl: './categorize-transaction-dialog.component.html',
  styleUrls: ['./categorize-transaction-dialog.component.scss']
})
export class CategorizeTransactionDialogComponent implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  selectedCategory: any = null;
  selectedSubcategory: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CategorizeTransactionDialogComponent>,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService
  ) { }

  ngOnInit() {
    this.categoriesService.getCategories().subscribe((cats) => {
      this.categories = cats;

      if (this.data.category?.parentCode) {
        this.selectedCategory = this.categories.find(
          c => c.code === this.data.category.parentCode
        );
        this.filterSubcategories();
        this.selectedSubcategory = this.categories.find(
          c => c.code === this.data.category.code
        );
      } else {
        this.selectedCategory = this.categories.find(
          c => c.code === this.data.category?.code
        );
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
      this.selectedCategory = null;
      return;
    }
    this.subcategories = this.categories.filter(
      cat => cat.parentCode === this.selectedCategory.code
    );
    if (!this.subcategories.find(s => s.code === this.selectedSubcategory?.code)) {
      this.selectedSubcategory = null;
    }
  }

  apply() {
    const code = this.selectedSubcategory?.code || this.selectedCategory?.code;
    if (!code) return;

    // if multiple IDs passed, do them all, else just one
    const ids: number[] = this.data.ids ?? [this.data.id];
    this.transactionsService
      .categorizeMultiple(ids, code)
      .subscribe(() => this.dialogRef.close(true));
  }

}
