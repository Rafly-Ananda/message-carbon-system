export interface RequestResponse {
  status_code: number;
  error: boolean;
  result?: Array<object | string | number | boolean>;
  message?: string;
}
