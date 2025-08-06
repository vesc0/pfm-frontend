import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SpendingGroup, ApiSpendingResponse, ChartDataItem, AnalyticsFilters } from '../models/analytics.model';
import { CategoriesService } from './categories.service';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/spending-analytics`;

  constructor(private http: HttpClient, private categoriesService: CategoriesService) { }

  getSpendingsByCategory(filters?: AnalyticsFilters): Observable<SpendingGroup[]> {
    let params = new HttpParams();

    if (filters?.startDate) { params = params.set('start-date', filters.startDate); }
    if (filters?.endDate) { params = params.set('end-date', filters.endDate); }
    if (filters?.categoryCode) { params = params.set('catcode', filters.categoryCode); }

    return this.http
      .get<ApiSpendingResponse>(this.apiUrl, { params })
      .pipe(
        map(resp =>
          resp.groups.map(g => ({
            catCode: g.catcode,
            amount: g.amount,
            count: g.count
          }))
        )
      );
  }

  getSpendingsForChart(filters?: AnalyticsFilters): Observable<ChartDataItem[]> {
    return this.categoriesService.getCategories().pipe(
      switchMap(categories => {
        return this.getSpendingsByCategory(filters).pipe(
          map(groups => {
            return groups.map(g => {
              const category = categories.find(c => c.code === g.catCode);
              return {
                rawCode: g.catCode,
                name: category?.name ?? g.catCode,
                value: g.amount
              };
            })
              .filter(d => d.value > 0);
          })
        );
      })
    );
  }

  generateChartOptions(data: ChartDataItem[]): any {
    if (data.length === 0) { return null; }

    return {
      tooltip: {
        trigger: 'item',
        formatter: (info: any) => `${info.name}: ${info.value.toFixed(2)}`
      },
      series: [{
        type: 'treemap',
        nodeClick: false,
        label: {
          show: true,
          formatter: (info: any) => `${info.name}\n${info.value.toFixed(2)}`
        },
        data
      }]
    };
  }
  
}