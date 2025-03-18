import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import { CultureKindLabels } from 'maestro-shared/referential/CultureKind';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from 'maestro-shared/referential/Matrix/MatrixPart';
import { StageLabels } from 'maestro-shared/referential/Stage';
import {
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useMemo } from 'react';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { useGetPrescriptionSubstancesQuery } from 'src/services/prescription.service';
import { quote } from 'src/utils/stringUtils';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';
import SampleDocument from '../../../components/SampleDocument/SampleDocument';

interface Props {
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
  showLabel?: boolean;
}
const MatrixStepSummary = ({ sample, showLabel }: Props) => {
  const { laboratory } = usePartialSample(sample);
  const { data: substances } = useGetPrescriptionSubstancesQuery(
    sample.prescriptionId ?? skipToken
  );

  const monoSubstances = useMemo(() => {
    return substances?.filter(
      (substance) => substance.analysisMethod === 'Mono'
    );
  }, [substances]);

  const multiSubstances = useMemo(() => {
    return substances?.filter(
      (substance) => substance.analysisMethod === 'Multi'
    );
  }, [substances]);

  return (
    <StepSummary
      label={
        <Badge className={cx('fr-badge--green-menthe')}>
          La matrice contrôlée
        </Badge>
      }
      showLabel={showLabel}
    >
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-restaurant-line')}></div>
        <div>
          Catégorie de matrice programmée :{' '}
          <b>{MatrixKindLabels[sample.matrixKind]}</b>
          <div>
            Matrice : <b>{MatrixLabels[sample.matrix]}</b>
          </div>
          <div>
            LMR/ Partie du végétal concernée :{' '}
            <b>{MatrixPartLabels[sample.matrixPart]}</b>
          </div>
          {sample.matrixDetails && (
            <div>
              Détails de la matrice : <b>{sample.matrixDetails}</b>
            </div>
          )}
        </div>
      </div>
      {sample.specificData?.cultureKind && (
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
      {sample.specificData?.releaseControl && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-checkbox-circle-line')}></div>
          <div>
            <b>Contrôle libératoire</b>
          </div>
        </div>
      )}
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-mental-health-line')}></div>
        <div>
          Laboratoire destinataire :{' '}
          {laboratory ? (
            <b>{laboratory.name}</b>
          ) : (
            <span className="missing-data">Information non disponible</span>
          )}
        </div>
      </div>
      {!monoSubstances?.length && !multiSubstances?.length && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-list-ordered')}></div>
          <div className="missing-data">Méthode d'analyse non disponible</div>
        </div>
      )}
      {monoSubstances && monoSubstances.length > 0 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-list-ordered')}></div>
          <div>
            Analyses mono-résidu :{' '}
            <ul>
              {monoSubstances.map((analysis) => (
                <li key={analysis.substance.code}>
                  {analysis.substance.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {multiSubstances && multiSubstances.length > 0 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-list-ordered')}></div>
          <div>
            Analyses multi-résidus dont :{' '}
            <ul>
              {multiSubstances.map((analysis) => (
                <li key={analysis.substance.code}>
                  {analysis.substance.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {sample.documentIds?.map((documentId) => (
        <div className="summary-item icon-text">
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
