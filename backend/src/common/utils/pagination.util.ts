export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export function parsePagination(query: any): PaginationParams {
  const page = Math.max(1, parseInt(String(query?.page || DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(query?.limit || query?.pageSize || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const sortBy = String(query?.sortBy || query?.sort || '').trim() || undefined;
  const sortOrder = String(query?.sortOrder || query?.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
}

export function getPrismaSkipTake(pagination: PaginationParams) {
  const { page, limit } = pagination;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function getPrismaOrderBy(pagination: PaginationParams, defaultField: string = 'createdAt') {
  const field = pagination.sortBy || defaultField;
  return {
    [field]: pagination.sortOrder || 'desc',
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: PaginationParams,
): PaginatedResult<T> {
  const page = pagination.page || DEFAULT_PAGE;
  const limit = pagination.limit || DEFAULT_LIMIT;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
