import { z } from 'zod';

export const SampleStatus = z.enum(
  ['Draft', 'DraftCompany', 'DraftMatrix', 'DraftItems', 'Submitted', 'Sent'],
  {
    errorMap: () => ({ message: 'Statut non renseigné.' }),
  }
);

export type SampleStatus = z.infer<typeof SampleStatus>;

export const SampleStatusList: SampleStatus[] = SampleStatus.options;

export const DraftStatusList: SampleStatus[] = [
  'Draft',
  'DraftCompany',
  'DraftMatrix',
  'DraftItems',
];

export const SampleStatusLabels: Record<SampleStatus, string> = {
  Draft: 'Brouillon',
  DraftCompany: 'Brouillon',
  DraftMatrix: 'Brouillon',
  DraftItems: 'Brouillon',
  Submitted: 'A envoyer',
  Sent: 'Envoyé',
};
