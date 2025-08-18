import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoriesService } from '../../services/categories.service';
import { TransactionsService } from '../../services/transactions.service';
import { NotificationService } from '../../services/notification.service';
import { Category } from '../../models/category.model';
import { SplitRow, Split } from '../../models/transaction.model';

@Component({
  selector: 'app-split-transaction-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './split-transaction-dialog.component.html',
  styleUrls: ['./split-transaction-dialog.component.scss']
})
export class SplitTransactionDialogComponent implements OnInit {
  categories: Category[] = [];
  splits: SplitRow[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      id: number;
      amount: number;
      existingSplits?: Split[]
    },
    public dialogRef: MatDialogRef<SplitTransactionDialogComponent>,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.categoriesService.getCategories().subscribe(cats => {
      this.categories = cats;

      if (this.data.existingSplits && this.data.existingSplits.length > 0) {
        // Populate with existing splits
        this.splits = this.data.existingSplits.map(split => this.createRowFromSplit(split));
      } else {
        // Create default empty splits
        this.splits = [this.createRow(), this.createRow()];
      }
    });
  }

  private createRow(): SplitRow {
    return {
      category: null,
      subcategory: null,
      subcategories: [],
      amount: null
    };
  }

  private createRowFromSplit(split: Split): SplitRow {
    const category = split.category;
    const subcategories = category && category.parentCode ?
      [] :
      this.categories.filter(c => c.parentCode === category?.code);

    // Determine if this is a subcategory (has parent) or main category
    let mainCategory: Category | null = null;
    let subcategory: Category | null = null;

    if (category) {
      if (category.parentCode) {
        // This is a subcategory, find its parent
        mainCategory = this.categories.find(c => c.code === category.parentCode) || null;
        subcategory = category;
      } else {
        // This is a main category
        mainCategory = category;
        subcategory = null;
      }
    }

    const row: SplitRow = {
      category: mainCategory,
      subcategory: subcategory,
      subcategories: mainCategory ? this.categories.filter(c => c.parentCode === mainCategory!.code) : [],
      amount: split.amount
    };

    return row;
  }

  onCategoryChange(i: number) {
    const cat = this.splits[i].category!;
    this.splits[i].subcategories = this.categories.filter(c => c.parentCode === cat.code);

    if (!this.splits[i].subcategories.find(s => s === this.splits[i].subcategory)) {
      this.splits[i].subcategory = null;
    }
  }

  addSplit() {
    this.splits.push(this.createRow());
  }

  removeSplit(i: number) {
    this.splits.splice(i, 1);
  }

  totalSplits(): number {
    return this.splits.reduce((sum, r) => sum + (r.amount || 0), 0);
  }

  sumMatches(): boolean {
    return Math.abs(this.totalSplits() - this.data.amount) < 0.01;
  }

  formValid(): boolean {
    return this.splits.every(r => r.category && r.amount! > 0);
  }

  get categoriesWithoutParent(): Category[] {
    return this.categories.filter(cat => !cat.parentCode);
  }

  apply() {
    const payload = this.transactionsService.prepareSplitRequests(this.splits);

    this.transactionsService
      .splitTransaction(this.data.id, payload)
      .subscribe({
        next: (response) => {
          this.notificationService.handleSuccess(response, 'Transaction split successfully.');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.notificationService.handleHttpError(error, 'An error occurred while splitting the transaction.');
        }
      });
  }

}