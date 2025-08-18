import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { AnalyticsService } from '../../services/analytics.service';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.model';
import { AnalyticsFilters, ChartDataItem } from '../../models/analytics.model';

@Component({
  selector: 'app-analytics-treemap',
  standalone: true,
  imports: [CommonModule,
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
  showFilters = true;

  constructor(private analytics: AnalyticsService, private categoriesSvc: CategoriesService) { }

  ngOnInit(): void {
    // Set default dates: one month back to today
    const today = new Date();
    const oneMonthBack = new Date();
    oneMonthBack.setMonth(today.getMonth() - 1);

    this.startDate.setValue(oneMonthBack.toISOString().split('T')[0]);
    this.endDate.setValue(today.toISOString().split('T')[0]);

    this.categoriesSvc.getCategories().subscribe(cats => {
      this.allCategories = cats;
      this.load();
    });
  }

  load(catCode?: string): void {
    this.currentCatCode = catCode;
    this.loading = true;

    const filters: AnalyticsFilters = {
      startDate: this.startDate.value ?? undefined,
      endDate: this.endDate.value ?? undefined,
      categoryCode: catCode
    };

    this.analytics.getSpendingsForChart(filters)
      .subscribe((data: ChartDataItem[]) => {
        this.hasData = data.length > 0;
        this.chartOption = this.analytics.generateChartOptions(data);
        this.loading = false;
      });
  }

  onChartClick(params: any): void {
    const code = params.data?.rawCode;
    if (code) { this.load(code); }
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
    // Reset to default dates: one month back to today
    const today = new Date();
    const oneMonthBack = new Date();
    oneMonthBack.setMonth(today.getMonth() - 1);

    this.startDate.setValue(oneMonthBack.toISOString().split('T')[0]);
    this.endDate.setValue(today.toISOString().split('T')[0]);
    this.load(this.currentCatCode);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

}