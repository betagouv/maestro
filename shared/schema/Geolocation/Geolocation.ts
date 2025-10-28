import { isNil } from 'lodash-es';
import { z } from 'zod';

export const Geolocation = z.object(
  {
    x: z.number(),
    y: z.number()
  },
  {
    error: (issue) =>
      isNil(issue.input)
        ? 'Veuillez renseigner la localisation.'
        : issue.message
  }
);
export type Geolocation = z.infer<typeof Geolocation>;
