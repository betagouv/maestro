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

export const SampleStatusLabels: Record<SampleStatus, string> = {
  Draft: 'Brouillon',
  DraftMatrix: 'Brouillon',
  DraftItems: 'Brouillon',
  Submitted: 'A envoyer',
  Sent: 'Transmis au labo',
  NotAdmissible: 'Non recevable',
  Analysis: 'En cours d’analyse',
  Completed: 'Terminé',
};

export const isAdmissibleStatus = (status: SampleStatus): boolean | undefined =>
  status === 'Analysis' ? true : status === 'NotAdmissible' ? false : undefined;
