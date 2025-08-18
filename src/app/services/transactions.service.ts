import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Transaction, TransactionFilters, TransactionsResponse, Split, SplitRequest } from '../models/transaction.model';
import { CategoriesService } from './categories.service';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private categoriesService: CategoriesService) { }

  getTransactions(filters: TransactionFilters): Observable<{ transactions: Transaction[], totalCount: number }> {
    const params: Record<string, string> = {
      'page': filters.page.toString(),
      'page-size': filters.pageSize.toString(),
      'sort-by': filters.sortBy,
      'sort-order': filters.sortOrder
    };

    if (filters.transactionKinds && filters.transactionKinds.length > 0) {
      params['transaction-kind'] = filters.transactionKinds.join(',');
    }

    if (filters.startDate) {
      params['start-date'] = new Date(filters.startDate).toISOString();
    }

    if (filters.endDate) {
      params['end-date'] = new Date(filters.endDate).toISOString();
    }

    return this.categoriesService.getCategoryMap().pipe(
      switchMap(categoryMap =>
        this.http.get<TransactionsResponse>(`${this.apiUrl}/transactions`, { params }).pipe(
          map(resp => {
            const totalCount = resp['total-count'] ?? (resp.items?.length || 0);
            const items = resp.items ?? resp;
            const transactions = this.mapApiTransactionsToModel(items, categoryMap);

            return {
              transactions,
              totalCount
            };
          })
        )
      )
    );
  }

  private mapApiTransactionsToModel(items: any[], categoryMap: Map<string, Category>): Transaction[] {
    return items.map((tx: any) => {
      const code = tx['catcode'] as string | undefined;
      const splits: Split[] = (tx['splits'] as any[] || []).map(s => {
        const splitCode = s.catCode ?? s['catcode'];
        return {
          amount: s.amount,
          catCode: splitCode,
          category: categoryMap.get(splitCode)
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
        catCode: code,
        category: code ? categoryMap.get(code) : undefined,
        splits,
        selected: false
      } as Transaction;
    });
  }

  categorizeTransaction(id: number, catCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/${id}/categorize`, { 'catcode': catCode });
  }

  categorizeMultiple(ids: number[], catCode: string): Observable<any> {
    const calls = ids.map(id => this.categorizeTransaction(id, catCode));
    return forkJoin(calls);
  }

  splitTransaction(id: number, splits: SplitRequest[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/${id}/split`, { 'splits': splits });
  }

  prepareSplitRequests(splits: any[]): SplitRequest[] {
    return splits.map(r => ({
      catcode: r.subcategory?.code ?? r.category!.code,
      amount: r.amount!
    }));
  }

}
