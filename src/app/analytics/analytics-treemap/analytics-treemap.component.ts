import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-analytics-treemap',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './analytics-treemap.component.html',
  styleUrls: ['./analytics-treemap.component.scss']
})
export class AnalyticsTreemapComponent implements OnInit, AfterViewInit {
  chartOption: any = {};
  loading = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:5138/spending-analytics')
      .subscribe(data => {
        this.chartOption = {
          tooltip: {
            formatter: (info: any) => `${info.name}: ${info.value}`
          },
          series: [{
            type: 'treemap',
            data: this.toTreeMapData(data)
          }]
        };
        this.loading = false;
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  private toTreeMapData(data: any[]): any[] {
    return data.map(cat => ({
      name: cat['category-name'],
      value: cat.amount,
      children: (cat.children?.length ?? 0) > 0
        ? this.toTreeMapData(cat.children)
        : undefined
    }));
  }
}
