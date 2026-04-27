import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { AnalysisDaiAttempt } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiAnalysisGroup';
import DocumentLink from 'src/components/DocumentLink/DocumentLink';

export const documentsModal = createModal({
  id: 'analysis-dai-documents-modal',
  isOpenedByDefault: false
});

interface Props {
  selectedDai: AnalysisDaiAttempt | null;
}

export const DocumentsModal = ({ selectedDai }: Props) => {
  return (
    <documentsModal.Component
      title="Documents liés"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Fermer',
          doClosesModal: true,
          priority: 'secondary'
        }
      ]}
    >
      {selectedDai && selectedDai.documents.length > 0 ? (
        <ul className={cx('fr-raw-list')}>
          {selectedDai.documents.map((doc) => (
            <li key={doc.id}>
              <DocumentLink documentId={doc.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun document.</p>
      )}
    </documentsModal.Component>
  );
};
