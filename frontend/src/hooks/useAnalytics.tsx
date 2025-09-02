import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import z from 'zod/v4';

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
    ...(SampleStatus.options.map(
      (status) => `submit_${status}`
    ) as `submit_${SampleStatus}`[])
  ]),
  support_document: z.enum(
    SampleStatus.options.map((status) => `download_${status}`) as [
      `download_${SampleStatus}`,
      ...`download_${SampleStatus}`[]
    ]
  )
} as const satisfies Record<TrackEventCategory, z.ZodEnum<any>>;

export const useAnalytics = () => {
  const trackEvent = <T extends TrackEventCategory>(
    category: T,
    action: z.infer<(typeof trackEventAction)[T]>,
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
