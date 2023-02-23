export interface PagedResult<T> {
  totalResults: number;
  currentPage: number;
  totalPage: number;
  pageSize: number;
  items: T[];
}
