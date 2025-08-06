export interface SpendingGroup {
  catCode: string;
  amount: number;
  count: number;
}

export interface ApiSpendingGroup {
  catcode: string;
  amount: number;
  count: number;
}

export interface ApiSpendingResponse {
  groups: ApiSpendingGroup[];
}

export interface ChartDataItem {
  rawCode: string;
  name: string;
  value: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  categoryCode?: string;
}
