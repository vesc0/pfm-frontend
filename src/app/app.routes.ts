import { Routes } from '@angular/router';
import { TransactionsListComponent } from './transactions/transactions-list/transactions-list.component';
import { AnalyticsTreemapComponent } from './analytics/analytics-treemap/analytics-treemap.component';

export const routes: Routes = [
  { path: 'transactions', component: TransactionsListComponent },
  { path: 'analytics', component: AnalyticsTreemapComponent },
];
