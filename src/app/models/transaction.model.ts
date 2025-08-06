import { Category } from './category.model';

export interface Split {
  amount: number;
  catCode: string;
  category?: Category;
}

export interface Transaction {
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
  category?: Category;
  splits: Split[];
  selected?: boolean; // UI state
}

export interface TransactionFilters {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  transactionKinds?: string[];
  startDate?: Date | string;
  endDate?: Date | string;
}

export const TRANSACTION_KINDS: Record<string, string> = {
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

export interface SplitRequest {
  catcode: string;
  amount: number;
}

export interface TransactionsResponse {
  items: any[];
  'total-count'?: number;
}

export interface SplitRow {
  category: Category | null;
  subcategory: Category | null;
  subcategories: Category[];
  amount: number | null;
}
