import { z } from 'zod';

export const DocumentDownloadOptions = z.object({
  download: z
    .preprocess((val) => val === true || val === 'true', z.boolean())
    .nullish()
});

export type DocumentDownloadOptions = z.infer<typeof DocumentDownloadOptions>;
