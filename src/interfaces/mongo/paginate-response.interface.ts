export interface TypeormMongoPaginate {
  status_code: number;
  error: boolean;
  data: Object[];
  total: number;
  current_page: number;
  next_page: number;
  prev_page: number;
  last_page: number;
}
