import CallOut from '@codegouvfr/react-dsfr/CallOut';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { AnalysisRaiWithRelations } from 'maestro-shared/schema/AnalysisRai/AnalysisRaiWithRelations';

export const retryModal = createModal({
  id: 'analysis-rai-retry-modal',
  isOpenedByDefault: false
});

interface Props {
  selectedRai: AnalysisRaiWithRelations | null;
  onRetry: () => Promise<void>;
}

export const RetryModal = ({ selectedRai, onRetry }: Props) => (
  <retryModal.Component
    title="Relancer la RAI"
    concealingBackdrop={false}
    topAnchor
    buttons={[
      {
        children: 'Annuler',
        doClosesModal: true,
        priority: 'secondary'
      },
      {
        children: 'Relancer la RAI',
        doClosesModal: true,
        priority: 'primary',
        onClick: onRetry
      }
    ]}
  >
    <p>
      Le traitement va être rejoué à partir des documents reçus. Si le
      retraitement réussit, l'état passera à <strong>Traitée</strong>. En cas de
      nouvelle erreur, le message ci-dessous sera mis à jour.
    </p>
    {selectedRai?.state === 'ERROR' && selectedRai.message && (
      <CallOut title="Message d'erreur actuel">{selectedRai.message}</CallOut>
    )}
  </retryModal.Component>
);
