import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Category {
  code: string;
  name: string;
  parentCode: string | null;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = 'http://localhost:5138';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ items: any[] }>(`${this.apiUrl}/categories`)
      .pipe(
        map(resp =>
          resp.items.map(item => ({
            code: item.code,
            name: item.name,
            parentCode: item['parent-code'] as string | null
          }))
        )
      );
  }
}
