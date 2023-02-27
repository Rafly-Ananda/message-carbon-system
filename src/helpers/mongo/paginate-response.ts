import { TypeormMongoPaginate } from "src/interfaces/mongo/paginate-response.interface";

export const paginateResponse = (
  data: object[],
  page: number,
  limit: number,
  total: number,
): TypeormMongoPaginate => {
  const result = data;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;
  return {
    status_code: 200,
    error: false,
    data: [...result],
    total: total,
    current_page: page,
    next_page: nextPage,
    prev_page: prevPage,
    last_page: lastPage,
  };
};
