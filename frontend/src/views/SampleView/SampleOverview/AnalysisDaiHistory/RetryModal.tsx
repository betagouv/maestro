import CallOut from '@codegouvfr/react-dsfr/CallOut';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { AnalysisDaiAttempt } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiAnalysisGroup';

export const retryModal = createModal({
  id: 'analysis-dai-retry-modal',
  isOpenedByDefault: false
});

interface Props {
  selectedDai: AnalysisDaiAttempt | null;
  onRetry: () => Promise<void>;
}

export const RetryModal = ({ selectedDai, onRetry }: Props) => (
  <retryModal.Component
    title="Relancer la DAI"
    concealingBackdrop={false}
    topAnchor
    buttons={[
      {
        children: 'Annuler',
        doClosesModal: true,
        priority: 'secondary'
      },
      {
        children: 'Relancer la DAI',
        doClosesModal: true,
        priority: 'primary',
        onClick: onRetry
      }
    ]}
  >
    <p>Une nouvelle DAI en état "En attente" sera créée pour cette analyse.</p>
    {selectedDai?.state === 'ERROR' && selectedDai.message && (
      <CallOut title="Message d'erreur">{selectedDai.message}</CallOut>
    )}
  </retryModal.Component>
);
