import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { TransactionsService } from '../../services/transactions.service';
import { CategoriesService } from '../../services/categories.service';
import { CategorizeTransactionDialogComponent } from '../categorize-transaction-dialog/categorize-transaction-dialog.component';
import { SplitTransactionDialogComponent } from '../split-transaction-dialog/split-transaction-dialog.component';
import { Transaction, TransactionFilters, TRANSACTION_KINDS } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatPaginatorModule],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
  transactions: Transaction[] = [];
  transactionKinds: string[] = [];
  selectedKinds: string[] = [];
  fromDate: string | null = null;
  toDate: string | null = null;
  pageSize = 10;
  pageNumber = 1;
  totalItems = 0;
  sortBy = "date";
  sortOrder = "desc";

  kindLabels = TRANSACTION_KINDS;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  showBulkCategorize = false;
  showFilters = true;
  showKindDropdown = false;

  constructor(
    private transactionsService: TransactionsService,
    private categoriesService: CategoriesService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.transactionKinds = Object.keys(this.kindLabels);
    this.fetchTransactions();
  }

  private fetchTransactions(): void {
    const filters: TransactionFilters = {
      page: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      transactionKinds: this.selectedKinds.length > 0 ? this.selectedKinds : undefined,
      startDate: this.fromDate || undefined,
      endDate: this.toDate || undefined
    };

    this.transactionsService.getTransactions(filters)
      .subscribe(result => {
        this.transactions = result.transactions;
        this.totalItems = result.totalCount;
      });
  }

  onFilterApply(): void {
    this.pageNumber = 1;
    this.fetchTransactions();
  }

  onFilterClear(): void {
    this.selectedKinds = [];
    this.fromDate = null;
    this.toDate = null;
    this.pageNumber = 1;
    this.fetchTransactions();
  }

  onPageChange(e: PageEvent): void {
    this.pageNumber = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.fetchTransactions();
  }

  openCategorizeDialog(tx: Transaction): void {
    const ref = this.dialog.open(CategorizeTransactionDialogComponent, {
      data: {
        id: Number(tx.id),
        category: tx.category
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.fetchTransactions();
    });
  }

  openSplitDialog(tx: Transaction): void {
    const ref = this.dialog.open(SplitTransactionDialogComponent, {
      data: { id: Number(tx.id), amount: tx.amount }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.fetchTransactions();
    });
  }

  toggleBulkCategorize(): void {
    this.showBulkCategorize = !this.showBulkCategorize;
    if (!this.showBulkCategorize) {
      this.transactions.forEach(t => t.selected = false);
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleKindDropdown(): void {
    this.showKindDropdown = !this.showKindDropdown;
  }

  onKindToggle(kind: string): void {
    const index = this.selectedKinds.indexOf(kind);
    if (index > -1) {
      this.selectedKinds.splice(index, 1);
    } else {
      this.selectedKinds.push(kind);
    }
  }

  getKindDisplayText(): string {
    if (this.selectedKinds.length === 0) {
      return 'All';
    } else if (this.selectedKinds.length === 1) {
      return this.kindLabels[this.selectedKinds[0]] || this.selectedKinds[0];
    } else {
      return `${this.selectedKinds.length} selected`;
    }
  }

  anySelected(): boolean {
    return this.transactions.some(t => t.selected);
  }

  selectedCount(): number {
    return this.transactions.filter(t => t.selected).length;
  }

  onBulkProceed(): void {
    const ids = this.transactions
      .filter(t => t.selected)
      .map(t => Number(t.id));
    if (!ids.length) return;

    const ref = this.dialog.open(CategorizeTransactionDialogComponent, {
      data: { ids }
    });

    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.fetchTransactions();
        this.toggleBulkCategorize();
      }
    });
  }

  trackByTransactionId(index: number, transaction: Transaction): string {
    return transaction.id;
  }
  
}
