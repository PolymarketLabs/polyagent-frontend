export type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: Pagination;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type KeywordParams = {
  keyword?: string;
};

export type SortOrder = "ASC" | "DESC";
