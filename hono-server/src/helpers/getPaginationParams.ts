import { Context } from 'hono';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(c: Context): PaginationParams {
  const pageParam = c.req.query('page');
  const limitParam = c.req.query('limit');

  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;
  const limit = limitParam ? parseInt(limitParam, 10) || 20 : 20;

  const effectiveLimit = Math.max(1, limit);
  const skip = (Math.max(1, page) - 1) * effectiveLimit;

  return { page, limit: effectiveLimit, skip };
}

export default getPaginationParams;
