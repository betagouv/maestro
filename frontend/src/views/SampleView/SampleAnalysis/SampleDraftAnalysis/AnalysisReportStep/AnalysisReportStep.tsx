import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { AnalysisDocumentPreview } from '../../../components/AnalysisDocumentPreview';
import { AnalysisAddFileModal } from '../../SampleAnalysisForm/AnalysisAddFileModal';

interface Props {
  sampleId: string;
  partialAnalysis: PartialAnalysis | undefined;
}

const addFileModal = createModal({
  id: `add-file-modale-id`,
  isOpenedByDefault: false
});

export const AnalysisReportStep = ({ sampleId, partialAnalysis }: Props) => {
  return (
    <>
      <AnalysisDocumentPreview
        analysisId={partialAnalysis?.id}
        sampleId={sampleId}
        readonly={false}
        button={
          <Button
            priority="secondary"
            iconId="fr-icon-add-line"
            className={cx('fr-mt-0')}
            size="small"
            type={'button'}
            onClick={() => {
              addFileModal.open();
            }}
          >
            Ajouter
          </Button>
        }
      />

      <AnalysisAddFileModal
        modal={addFileModal}
        sampleId={sampleId}
        partialAnalysis={partialAnalysis}
      />
    </>
  );
};
