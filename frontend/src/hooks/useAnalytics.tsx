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
    'submit_step_1',
    'submit_step_2',
    'submit_step_3',
    'send'
  ]),
  support_document: z.enum([
    'download_step_1',
    'download_step_2',
    'download_step_3'
  ])
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
