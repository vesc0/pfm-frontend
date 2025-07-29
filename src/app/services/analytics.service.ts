import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// shape as returned by API
interface ApiGroup {
  catcode: string;
  amount: number;
  count: number;
}
interface ApiResponse {
  groups: ApiGroup[];
}

// internal shape
export interface SpendingGroup {
  catCode: string;
  amount: number;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = 'http://localhost:5138/spending-analytics';

  constructor(private http: HttpClient) { }

  getSpendingsByCategory(
    startDate?: string,
    endDate?: string,
    catCode?: string
  ): Observable<SpendingGroup[]> {
    let params = new HttpParams();
    if (startDate) { params = params.set('start-date', startDate); }
    if (endDate) { params = params.set('end-date', endDate); }
    if (catCode) { params = params.set('catcode', catCode); }

    return this.http.get<ApiResponse>(this.apiUrl, { params }).pipe(
      map(resp =>
        resp.groups.map(g => ({
          catCode: g.catcode,
          amount: g.amount,
          count: g.count
        }))
      )
    );
  }
}