import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private apiUrl = 'http://localhost:5138';

  constructor(private http: HttpClient) { }

  getTransactions(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions`, { params });
  }

  categorizeTransaction(id: number, body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/${id}/categorize`, body);
  }

  categorizeMultiple(ids: number[], catCode: string): Observable<any> {
    const calls = ids.map(id => this.http.post(`${this.apiUrl}/transactions/${id}/categorize`, { 'catcode': catCode }));
    return forkJoin(calls);
  }

  splitTransaction(id: number, splits: Array<{ 'catcode': string; amount: number }>): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/${id}/split`, { 'splits': splits }, { responseType: 'text' });
  }

}
