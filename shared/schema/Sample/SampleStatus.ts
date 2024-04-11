import { z } from 'zod';

export const SampleStatus = z.enum(
  ['Draft', 'DraftInfos', 'DraftItems', 'Submitted', 'Sent'],
  {
    errorMap: () => ({ message: 'Statut non renseigné.' }),
  }
);

export type SampleStatus = z.infer<typeof SampleStatus>;

export const SampleStatusList: SampleStatus[] = [
  'Draft',
  'DraftInfos',
  'DraftItems',
  'Submitted',
  'Sent',
];

export const SampleStatusLabels: Record<SampleStatus, string> = {
  Draft: 'Brouillon',
  DraftInfos: 'Brouillon',
  DraftItems: 'Brouillon',
  Submitted: 'A envoyer',
  Sent: 'Envoyé',
};
