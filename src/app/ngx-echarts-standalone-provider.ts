import { importProvidersFrom } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

export const provideNgxEchartsStandalone = () =>
  importProvidersFrom(NgxEchartsModule.forRoot({ echarts }));
