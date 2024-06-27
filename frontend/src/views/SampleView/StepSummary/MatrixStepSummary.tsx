import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useMemo } from 'react';
import { CultureKindLabels } from 'shared/referential/CultureKind';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from 'shared/referential/MatrixPart';
import { StageLabels } from 'shared/referential/Stage';
import { Sample } from 'shared/schema/Sample/Sample';
import { useGetLaboratoryQuery } from 'src/services/laboratory.service';
import { useFindSubstanceAnalysisQuery } from 'src/services/substance.service';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';

interface Props {
  sample: Sample;
  showLabel?: boolean;
}
const MatrixStepSummary = ({ sample, showLabel }: Props) => {
  const { data: substanceAnalysis } = useFindSubstanceAnalysisQuery({
    matrix: sample.matrix,
    year: sample.sampledAt.getFullYear(),
  });

  const { data: laboratory } = useGetLaboratoryQuery(sample.laboratoryId);

  const monoSubstances = useMemo(() => {
    return substanceAnalysis?.filter((analysis) => analysis.kind === 'Mono');
  }, [substanceAnalysis]);

  const multiSubstances = useMemo(() => {
    return substanceAnalysis?.filter((analysis) => analysis.kind === 'Multi');
  }, [substanceAnalysis]);

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
          Matrice : <b>{MatrixLabels[sample.matrix]}</b>
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
      {sample.cultureKind && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-seedling-line')}></div>
          <div>
            Type de culture : <b>{CultureKindLabels[sample.cultureKind]}</b>
          </div>
        </div>
      )}
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-sip-line')}></div>
        <div>
          Stade de prélèvement : <b>{StageLabels[sample.stage]}</b>
        </div>
      </div>
      {sample.releaseControl && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-checkbox-circle-line')}></div>
          <div>
            <b>Contrôle libératoire</b>
          </div>
        </div>
      )}
      {laboratory && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-checkbox-circle-line')}></div>
          <div>
            Laboratoire destinataire : <b>{laboratory.name}</b>
          </div>
        </div>
      )}
      {monoSubstances && monoSubstances.length > 0 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-checkbox-circle-line')}></div>
          <div>
            Analyses mono-résidu :{' '}
            <ul>
              {monoSubstances.map((analysis) => (
                <li key={analysis.matrix}>{analysis.substance.label}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {multiSubstances && multiSubstances.length > 0 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-checkbox-circle-line')}></div>
          <div>
            Analyses multi-résidus dont :{' '}
            <ul>
              {multiSubstances.map((analysis) => (
                <li key={analysis.matrix}>{analysis.substance.label}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {sample.notesOnMatrix && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>“ {sample.notesOnMatrix} “</b>
            </div>
          </div>
        </div>
      )}
    </StepSummary>
  );
};

export default MatrixStepSummary;
