import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { TransactionsService } from '../../services/transactions.service';
import { CategoriesService, Category } from '../../services/categories.service';
import { CategorizeTransactionDialogComponent } from '../categorize-transaction-dialog/categorize-transaction-dialog.component';
import { SplitTransactionDialogComponent } from '../split-transaction-dialog/split-transaction-dialog.component';

interface Split {
  amount: number;
  catCode: string;
  category?: Category;
}

interface Transaction {
  id: string;
  date: string;
  direction: string;
  amount: number;
  beneficiaryName: string;
  description?: string;
  currency: string;
  mcc?: number;
  kind: string;
  catCode?: string;
  category?: Category; // looked up from CategoriesService
  splits: Split[];
  selected: boolean;
}

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
  transactions: Transaction[] = [];
  transactionKinds: string[] = [];
  selectedKind = '';
  fromDate: string | null = null;
  toDate: string | null = null;
  pageSize = 10;
  pageNumber = 1;
  totalItems = 0;
  sortBy = "date";
  sortOrder = "desc";

  kindLabels: Record<string, string> = {
    dep: 'Deposit',
    wdw: 'Withdrawal',
    pmt: 'Payment',
    fee: 'Fee',
    inc: 'Income',
    rev: 'Reversal',
    adj: 'Adjustment',
    lnd: 'Lending',
    lnr: 'Loan Repayment',
    fcx: 'Foreign Exchange',
    aop: 'Account Opening',
    acl: 'Account Closing',
    spl: 'Split',
    sal: 'Salary'
  };

  // full list of categories to build names lookup
  private allCategories: Category[] = [];
  private categoryMap = new Map<string, Category>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  showBulkCategorize = false;
  showFilters = true; // Show filters by default on large screens, toggle on small

  constructor(
    private transactionsService: TransactionsService,
    private categoriesService: CategoriesService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // derive kinds from the labels map
    this.transactionKinds = Object.keys(this.kindLabels);
    // load categories
    this.categoriesService.getCategories().subscribe(cats => {
      this.allCategories = cats;
      this.categoryMap = new Map(cats.map(c => [c.code, c]));
      // then fetch transactions
      this.fetchTransactions();
    });
  }

  private fetchTransactions(): void {

    const params: any = {
      'page': this.pageNumber,
      'page-size': this.pageSize,
      'sort-by': this.sortBy,
      'sort-order': this.sortOrder
    };
    //ime parametra
    if (this.selectedKind) {
      params['transaction-kind'] = this.selectedKind;
    }
    if (this.fromDate) {
      params['start-date'] = new Date(this.fromDate).toISOString();
    }
    if (this.toDate) {
      params['end-date'] = new Date(this.toDate).toISOString();
    }

    this.transactionsService.getTransactions(params)
      .subscribe((resp: any) => {
        this.totalItems = resp['total-count'] ?? (resp.items?.length || 0);
        const items = resp.items ?? resp;
        this.transactions = items.map((tx: any) => {
          const code = tx['catcode'] as string | undefined;
          const splits: Split[] = (tx['splits'] as any[] || []).map(s => {
            const splitCode = s.catCode ?? s['catcode'];
            return {
              amount: s.amount,
              catCode: splitCode,
              category: this.categoryMap.get(splitCode)
            };
          });
          return {
            id: tx.id,
            date: tx.date,
            direction: tx.direction,
            amount: tx.amount,
            beneficiaryName: tx['beneficiary-name'],
            description: tx.description,
            currency: tx.currency,
            mcc: tx.mcc,
            kind: tx.kind,
            beneficiaryAvatar: tx['beneficiary-avatar'],
            catCode: code,
            category: code ? this.categoryMap.get(code) : undefined,
            splits,
            selected: false
          } as Transaction;
        });
      });
  }

  onFilterApply(): void {
    this.pageNumber = 1;
    this.fetchTransactions();
  }

  onFilterClear(): void {
    this.selectedKind = '';
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
}
