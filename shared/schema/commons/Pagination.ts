import { z } from 'zod';
export const Pagination = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive()
});

export type Pagination = z.infer<typeof Pagination>;

export const defaultPerPage = 12;
