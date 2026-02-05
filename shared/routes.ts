import { z } from 'zod';
import { apiResponseSchema, movieDetailSchema } from './schema';

export const api = {
  movies: {
    // General endpoint for categories (trending, indonesian-movies, etc.)
    list: {
      method: 'GET' as const,
      path: '/api/movies/:category',
      input: z.object({
        page: z.coerce.number().default(1).optional(),
      }).optional(),
      responses: {
        200: apiResponseSchema,
      },
    },
    // Search endpoint
    search: {
      method: 'GET' as const,
      path: '/api/search',
      input: z.object({
        q: z.string(),
      }),
      responses: {
        200: apiResponseSchema,
      },
    },
    // Detail endpoint
    detail: {
      method: 'GET' as const,
      path: '/api/detail',
      input: z.object({
        path: z.string(),
      }),
      responses: {
        200: movieDetailSchema,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
