import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Category {
  code: string;
  name: string;
  parentCode: string | null;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = 'http://localhost:5138/categories';

  constructor(private http: HttpClient) { }

  getCategories(parentCode?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (parentCode) {
      params = params.set('parent-id', parentCode);
    }
    return this.http
      .get<{ items: any[] }>(this.apiUrl, { params })
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
}
