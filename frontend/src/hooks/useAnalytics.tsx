import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import z from 'zod';

export const TrackEventCategory = z.enum([
  'geolocation',
  'sample',
  'support_document'
]);

export type TrackEventCategory = z.infer<typeof TrackEventCategory>;

export const trackEventAction = {
  geolocation: z.enum(['enable', 'disable']),
  sample: z.enum([
    'push_offline',
    ...SampleStatus.options.map((status) => `submit_${status}`)
  ]),
  support_document: z.enum(
    SampleStatus.options.map((status) => `download_${status}`) as [
      string,
      ...string[]
    ]
  )
} as const satisfies Record<TrackEventCategory, z.ZodEnum<any>>;

export const useAnalytics = () => {
  const trackEvent = (
    category: TrackEventCategory,
    action: z.infer<(typeof trackEventAction)[TrackEventCategory]>,
    name?: string,
    value?: number
  ) => {
    if (window._paq) {
      window._paq.push(['trackEvent', category, action, name, value]);
    }
  };

  return {
    trackEvent
  };
};
