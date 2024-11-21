import { z } from 'zod';

export const FindSubstanceOptions = z.object({ q: z.string() });

export type FindSubstanceOptions = z.infer<typeof FindSubstanceOptions>;
