import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { CultureKindLabels } from 'maestro-shared/referential/CultureKind';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixPartLabels } from 'maestro-shared/referential/Matrix/MatrixPart';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import {
  getSampleMatrixLabel,
  isProgrammingPlanSample,
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';

import { pluralize, quote } from 'src/utils/stringUtils';
import StepSummary, {
  StepSummaryMode
} from 'src/views/SampleView/StepSummary/StepSummary';
import SampleDocument from '../../../components/SampleDocument/SampleDocument';

interface Props {
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
  mode?: StepSummaryMode;
  onEdit?: () => void;
}
const MatrixStepSummary = ({ sample, mode = 'section', onEdit }: Props) => {
  return (
    <StepSummary title="Matrice contrôlée" onEdit={onEdit} mode={mode}>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-restaurant-line')}></div>
        <div>
          <div>
            Catégorie de matrice programmée :{' '}
            <b>{MatrixKindLabels[sample.matrixKind]}</b>
          </div>
          <div>
            Matrice : <b>{getSampleMatrixLabel(sample)}</b>
          </div>
          {sample.specificData.programmingPlanKind === 'PPV' && (
            <>
              <div>
                LMR/ Partie du végétal concernée :{' '}
                <b>{MatrixPartLabels[sample.specificData.matrixPart]}</b>
              </div>
              <div>
                Détails de la matrice :{' '}
                <b>{sample.specificData.matrixDetails}</b>
              </div>
            </>
          )}
        </div>
      </div>

      {sample.specificData.programmingPlanKind === 'PPV' &&
        sample.specificData.cultureKind && (
          <div className="summary-item icon-text">
            <div className={cx('fr-icon-seedling-line')}></div>
            <div>
              Type de culture :{' '}
              <b>{CultureKindLabels[sample.specificData.cultureKind]}</b>
            </div>
          </div>
        )}
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-sip-line')}></div>
        <div>
          Stade de prélèvement : <b>{StageLabels[sample.stage]}</b>
        </div>
      </div>
      {sample.specificData.programmingPlanKind === 'PPV' &&
        sample.specificData.releaseControl && (
          <div className="summary-item icon-text">
            <div className={cx('fr-icon-checkbox-circle-line')}></div>
            <div>
              <b>Contrôle libératoire</b>
            </div>
          </div>
        )}
      {sample.specificData.programmingPlanKind === 'PPV' && (
        <>
          {isProgrammingPlanSample(sample) &&
            !sample.monoSubstances?.length &&
            !sample.multiSubstances?.length && (
              <div className="summary-item icon-text">
                <div className={cx('fr-icon-list-ordered')}></div>
                <div className="missing-data">
                  Méthode d'analyse non disponible
                </div>
              </div>
            )}
          {sample.monoSubstances && sample.monoSubstances.length > 0 && (
            <div className="summary-item icon-text">
              <div className={cx('fr-icon-list-ordered')}></div>
              <div>
                {pluralize(sample.monoSubstances.length)('Analyse')}{' '}
                mono-résidu :{' '}
                <ul>
                  {sample.monoSubstances.map((substance) => (
                    <li key={`Mono_${substance}`}>{SSD2IdLabel[substance]}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {sample.multiSubstances && (
            <div className="summary-item icon-text">
              <div className={cx('fr-icon-list-ordered')}></div>
              <div>
                Analyses multi-résidus dont :{' '}
                <ul>
                  {sample.multiSubstances.map((substance) => (
                    <li key={`Multi_${substance}`}>{SSD2IdLabel[substance]}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
      {sample.documentIds?.map((documentId) => (
        <div className="summary-item icon-text" key={documentId}>
          <div className={cx('fr-icon-attachment-line')}></div>
          <div className={cx('fr-col')}>
            Pièces jointes :{' '}
            <div className={cx('fr-mt-2w')}>
              <SampleDocument
                key={documentId}
                documentId={documentId}
                readonly
              />
            </div>
          </div>
        </div>
      ))}
      {sample.notesOnMatrix && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>{quote(sample.notesOnMatrix)}</b>
            </div>
          </div>
        </div>
      )}
    </StepSummary>
  );
};

export default MatrixStepSummary;
