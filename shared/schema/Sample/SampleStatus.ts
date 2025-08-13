import { z } from 'zod/v4';

export const SampleStatus = z.enum(
  [
    'Draft',
    'DraftMatrix',
    'DraftItems',
    'Submitted',
    'Sent',
    'NotAdmissible',
    'Analysis',
    'InReview',
    'Completed'
  ],
  {
    error: () => 'Statut non renseigné.'
  }
);

export type SampleStatus = z.infer<typeof SampleStatus>;

export const SampleStatusList: SampleStatus[] = SampleStatus.options;

export const DraftStatusList: SampleStatus[] = [
  'Draft',
  'DraftMatrix',
  'DraftItems'
];

export const InProgressStatusList: SampleStatus[] = [
  'Draft',
  'DraftMatrix',
  'DraftItems',
  'Submitted'
];

export const RealizedStatusList: SampleStatus[] = [
  'Sent',
  'NotAdmissible',
  'Analysis',
  'InReview',
  'Completed'
];

export const SampleStatusLabels: Record<SampleStatus, string> = {
  Draft: 'Brouillon',
  DraftMatrix: 'Brouillon',
  DraftItems: 'Brouillon',
  Submitted: 'À envoyer',
  Sent: 'Transmis au labo',
  NotAdmissible: 'Non recevable',
  Analysis: 'En cours d’analyse',
  InReview: 'À valider',
  Completed: 'Terminé'
};

export const SampleStatusSteps: Partial<Record<SampleStatus, number>> = {
  Draft: 1,
  DraftMatrix: 2,
  DraftItems: 3,
  Submitted: 4
};
