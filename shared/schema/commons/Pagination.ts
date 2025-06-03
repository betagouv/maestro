import { z } from 'zod/v4';
export const Pagination = z.object({
  page: z.coerce.number().int().positive(),
  perPage: z.coerce.number().int().positive()
});

export type Pagination = z.infer<typeof Pagination>;

export const defaultPerPage = 12;
