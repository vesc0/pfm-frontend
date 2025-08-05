import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { AnalyticsService, SpendingGroup } from '../../services/analytics.service';
import { CategoriesService, Category } from '../../services/categories.service';

@Component({
  selector: 'app-analytics-treemap',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './analytics-treemap.component.html',
  styleUrls: ['./analytics-treemap.component.scss']
})
export class AnalyticsTreemapComponent implements OnInit {
  chartOption: any = null;
  loading = true;
  hasData = false;
  currentCatCode?: string;

  startDate = new FormControl<string | null>(null);
  endDate = new FormControl<string | null>(null);

  private allCategories: Category[] = [];

  constructor(
    private analytics: AnalyticsService,
    private categoriesSvc: CategoriesService
  ) { }

  ngOnInit(): void {
    this.categoriesSvc.getCategories().subscribe(cats => {
      this.allCategories = cats;
      this.load();
    });
  }

  load(catCode?: string): void {
    this.currentCatCode = catCode;
    this.loading = true;

    const sd: string | undefined = this.startDate.value ?? undefined;
    const ed: string | undefined = this.endDate.value ?? undefined;

    this.analytics.getSpendingsByCategory(sd, ed, catCode)
      .subscribe((groups: SpendingGroup[]) => {
        const data = groups
          .map(g => {
            const category = this.allCategories.find(c => c.code === g.catCode);
            return {
              rawCode: g.catCode,
              name: category?.name ?? g.catCode,
              value: g.amount
            };
          })
          .filter(d => d.value > 0);

        this.hasData = data.length > 0;

        this.chartOption = this.hasData ? {
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
        } : null;

        this.loading = false;
      });
  }

  onChartClick(params: any): void {
    const code = params.data?.rawCode;
    if (code) {
      this.load(code);
    }
  }

  goBack(): void {
    if (!this.currentCatCode) return;
    const parent = this.allCategories.find(c => c.code === this.currentCatCode)?.parentCode;
    this.load(parent ?? undefined);
  }

  onFilter(): void {
    this.load(this.currentCatCode);
  }

  onFilterClear(): void {
    this.startDate.setValue(null);
    this.endDate.setValue(null);
    this.load(this.currentCatCode);
  }

  showFilters = true;
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
}