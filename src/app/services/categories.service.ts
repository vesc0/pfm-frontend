import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Category, CategoryResponse } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private cachedCategories$: Observable<Category[]> | null = null;

  constructor(private http: HttpClient) { }

  getCategories(parentCode?: string): Observable<Category[]> {
    if (!this.cachedCategories$) { this.cachedCategories$ = this.fetchCategories().pipe(shareReplay(1)); }

    return this.cachedCategories$.pipe(
      map(categories => parentCode
        ? categories.filter(cat => cat.parentCode === parentCode)
        : categories
      )
    );
  }

  private fetchCategories(): Observable<Category[]> {
    return this.http
      .get<CategoryResponse>(this.apiUrl)
      .pipe(
        map(resp =>
          resp.items.map(item => ({
            code: item.code,
            name: item.name,
            parentCode: item['parent-code'] || null
          }))
        )
      );
  }

  getCategoriesWithoutParent(): Observable<Category[]> {
    return this.getCategories().pipe(map(cats => cats.filter(cat => !cat.parentCode)));
  }

  getSubcategories(parentCode: string): Observable<Category[]> {
    return this.getCategories().pipe(map(cats => cats.filter(cat => cat.parentCode === parentCode)));
  }

  getCategoryMap(): Observable<Map<string, Category>> {
    return this.getCategories().pipe(map(categories => new Map(categories.map(c => [c.code, c]))));
  }

}
