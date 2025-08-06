export interface Category {
  code: string;
  name: string;
  parentCode: string | null;
}

export interface CategoryResponse {
  items: {
    code: string;
    name: string;
    'parent-code'?: string;
  }[];
}
