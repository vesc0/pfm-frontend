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

  generateChartOptions(items: ChartDataItem[]) {
    return {
      tooltip: {
        formatter: (info: any) => {
          const value = info.data?.value ?? info.value;
          return `${info.name}<br/>${value}`;
        }
      },
      series: [
        {
          type: 'treemap',
          roam: true,
          nodeClick: false,
          // Make treemap fill the container properly
          width: '100%',
          height: '100%',
          top: 15,
          left: 0,
          right: 0,
          bottom: 0,
          // Pass through code so it can be read in chartClick:
          data: items.map(i => ({ name: i.name, value: i.value, rawCode: i.rawCode })),
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: '{b}\n{c}',
            align: 'center',
            verticalAlign: 'middle',
            fontSize: 12,
            color: '#fff',
            overflow: 'truncate'
          },
          // Borders between tiles:
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2,
            gapWidth: 2
          },
          emphasis: {
            label: { show: true }
          }
        }
      ]
    };
  }

}