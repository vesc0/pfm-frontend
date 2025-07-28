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
  loading: boolean = true;
  hasData: boolean = false;
  currentCatcode?: string;

  startDate = new FormControl<string | null>(null);
  endDate = new FormControl<string | null>(null);

  private allCategories: Category[] = [];

  constructor(
    private analytics: AnalyticsService,
    private categoriesSvc: CategoriesService
  ) { }

  ngOnInit(): void {
    this.categoriesSvc.getCategories()
      .subscribe(cats => {
        this.allCategories = cats;
        this.load();
      });
  }

  load(catcode?: string): void {
    this.currentCatcode = catcode;
    this.loading = true;

    const sd: string | undefined = this.startDate.value ?? undefined;
    const ed: string | undefined = this.endDate.value ?? undefined;

    this.analytics.getSpendingsByCategory(sd, ed)
      .subscribe((groups: SpendingGroup[]) => {
        const levelCats = this.allCategories.filter(c =>
          catcode ? c.parentCode === catcode : c.parentCode == null
        );

        // Compute raw nodes then filter out zero-value entries
        const rawData = levelCats.map((c: Category) => {
          const descendants = this.getDescendantCodes(c.code);
          const codesToSum = [c.code, ...descendants];
          const total = codesToSum.reduce((sum, code) => {
            const g = groups.find(g => g.catCode === code);
            return sum + (g?.amount ?? 0);
          }, 0);
          return { rawCode: c.code, name: c.name, value: total };
        });

        const data = rawData.filter(d => d.value > 0);
        this.hasData = data.length > 0;

        if (this.hasData) {
          this.chartOption = {
            tooltip: {
              trigger: 'item',
              formatter: (info: any) => `${info.name}: ${info.value.toFixed(2)}`
            },
            series: [{
              type: 'treemap',
              nodeClick: false,
              label: {
                show: true,
                formatter: (info: any) =>
                  `${info.name}\n${info.value.toFixed(2)}`
              },
              data
            }]
          };
        } else {
          this.chartOption = null;
        }

        this.loading = false;
      });
  }

  onChartClick(params: any): void {
    const code = params.data?.rawCode;
    if (code) this.load(code);
  }

  goBack(): void {
    if (!this.currentCatcode) return;
    const parent = this.allCategories.find(c => c.code === this.currentCatcode)?.parentCode;
    this.load(parent || undefined);
  }

  private getDescendantCodes(code: string): string[] {
    const direct = this.allCategories
      .filter(c => c.parentCode === code)
      .map(c => c.code);
    return direct.flatMap(child => [child, ...this.getDescendantCodes(child)]);
  }

  onFilter(): void {
    this.load(this.currentCatcode);
  }

  showFilters = true;
  toggleFilters() { this.showFilters = !this.showFilters; }
}