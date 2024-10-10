import { z } from 'zod';

export const SampleStatus = z.enum(
  [
    'Draft',
    'DraftMatrix',
    'DraftItems',
    'Submitted',
    'Sent',
    'NotAdmissible',
    'Analysis',
    'Completed',
    'CompletedNotConform',
  ],
  {
    errorMap: () => ({ message: 'Statut non renseigné.' }),
  }
);

export type SampleStatus = z.infer<typeof SampleStatus>;

export const SampleStatusList: SampleStatus[] = SampleStatus.options;

export const DraftStatusList: SampleStatus[] = [
  'Draft',
  'DraftMatrix',
  'DraftItems',
];

export const CompletedStatusList: SampleStatus[] = [
  'Completed',
  'CompletedNotConform',
];

export const RealizedStatusList: SampleStatus[] = [
  'Sent',
  'NotAdmissible',
  'Analysis',
  ...CompletedStatusList,
];

export const SampleStatusLabels: Record<SampleStatus, string> = {
  Draft: 'Brouillon',
  DraftMatrix: 'Brouillon',
  DraftItems: 'Brouillon',
  Submitted: 'À envoyer',
  Sent: 'Transmis au labo',
  NotAdmissible: 'Non recevable',
  Analysis: 'En cours d’analyse',
  Completed: 'Terminé',
  CompletedNotConform: 'Terminé non conforme',
};
