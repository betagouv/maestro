import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { CultureKindLabels } from 'shared/referential/CultureKind';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from 'shared/referential/MatrixPart';
import { StageLabels } from 'shared/referential/Stage';
import { Sample } from 'shared/schema/Sample/Sample';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';

interface Props {
  sample: Sample;
}
const MatrixStepSummary = ({ sample }: Props) => {
  return (
    <StepSummary
      label={
        <Badge className={cx('fr-badge--green-menthe')}>
          La matrice contrôlée
        </Badge>
      }
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
