import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoriesService, Category } from '../../services/categories.service';
import { TransactionsService } from '../../services/transactions.service';

interface SplitRow {
  category: Category | null;
  subcategory: Category | null;
  subcategories: Category[];
  amount: number | null;
}

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
    @Inject(MAT_DIALOG_DATA) public data: { id: number; amount: number },
    public dialogRef: MatDialogRef<SplitTransactionDialogComponent>,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService
  ) { }

  ngOnInit() {
    this.categoriesService.getCategories().subscribe(cats => {
      this.categories = cats;
      this.splits = [this.createRow(), this.createRow()];
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

  onCategoryChange(i: number) {
    const cat = this.splits[i].category!;
    this.splits[i].subcategories = this.categories.filter(
      c => c.parentCode === cat.code
    );
    if (
      !this.splits[i].subcategories.find(
        s => s === this.splits[i].subcategory
      )
    ) {
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
    const payload = this.splits.map(r => {
      const obj: any = {
        amount: r.amount!,
        // if subcategory is selected, use its code, else use category code
        catcode: r.subcategory?.code ?? r.category!.code
      };

      return obj;
    });

    this.transactionsService
      .splitTransaction(this.data.id, payload)
      .subscribe(() => this.dialogRef.close(true));
  }
}
