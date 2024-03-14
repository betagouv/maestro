import { z } from 'zod';

export const SampleStatus = z.enum(['Draft', 'Submitted', 'Sent'], {
  errorMap: () => ({ message: 'Statut non renseigné.' }),
});

export type SampleStatus = z.infer<typeof SampleStatus>;

export const SampleStatusList: SampleStatus[] = ['Draft', 'Submitted', 'Sent'];

export const SampleStatusLabels: Record<SampleStatus, string> = {
  Draft: 'Brouillon',
  Submitted: 'A envoyer',
  Sent: 'Envoyé',
};
