import type { AnalysisDaiState } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiState';

export const AnalysisDaiStateLabels: Record<AnalysisDaiState, string> = {
  PENDING: 'En cours de traitement',
  QUEUED: 'En attente de dépôt',
  SENT: 'Envoyée',
  ERROR: 'Erreur'
};
