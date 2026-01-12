import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import {
  getSampleMatrixLabel,
  isProgrammingPlanSample,
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import {
  MatrixSpecificDataForm,
  MatrixSpecificDataFormInputProps
} from 'src/views/SampleView/DraftSample/MatrixStep/MatrixSpecificDataForm';
import {
  MatrixSpecificDataFormInputs,
  SampleMatrixSpecificDataKeys
} from 'src/views/SampleView/DraftSample/MatrixStep/MatrixSpecificDataFormInputs';

import { isNil } from 'lodash-es';
import { pluralize, quote } from 'src/utils/stringUtils';
import StepSummary, {
  StepSummaryMode
} from 'src/views/SampleView/StepSummary/StepSummary';
import SampleDocument from '../../../components/Sample/SampleDocument/SampleDocument';

const getSpecificDataValue = (
  inputKey: SampleMatrixSpecificDataKeys,
  specificData: SampleMatrixSpecificData
): string | null => {
  const value = specificData[inputKey as keyof typeof specificData];

  const input = MatrixSpecificDataFormInputs[inputKey];

  if (isNil(value)) {
    return null;
  }

  switch (input.inputType) {
    case 'checkbox':
      return value ? input.label : null;
    case 'select':
    case 'radio':
      return input.optionsLabels?.[value as string] || String(value);
    case 'text':
    case 'number':
    case 'textarea':
      return String(value);
    default:
      return String(value);
  }
};

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
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-sip-line')}></div>
        <div>
          Stade de prélèvement : <b>{StageLabels[sample.stage]}</b>
        </div>
      </div>

      {(
        Object.entries(
          MatrixSpecificDataForm[sample.specificData.programmingPlanKind]
        ) as [SampleMatrixSpecificDataKeys, MatrixSpecificDataFormInputProps][]
      )
        .filter(([_, inputProps]) => inputProps.position !== 'pre')
        .map(([inputKey, inputProps]) => {
          const value = getSpecificDataValue(inputKey, sample.specificData);
          if (!value) return null;

          const input = MatrixSpecificDataFormInputs[inputKey];

          return (
            <div key={inputKey} className="summary-item icon-text">
              <div className={cx(inputProps.iconId ?? 'fr-mr-9v')}></div>
              <div>
                {input.inputType === 'checkbox' ? (
                  <b>{value}</b>
                ) : (
                  <>
                    {inputProps.label ?? input.label} : <b>{value}</b>
                  </>
                )}
              </div>
            </div>
          );
        })}
      {isProgrammingPlanSample(sample) &&
        !sample.monoSubstances?.length &&
        !sample.multiSubstances?.length && (
          <div className="summary-item icon-text">
            <div className={cx('fr-icon-list-ordered')}></div>
            <div className="missing-data">Méthode d'analyse non disponible</div>
          </div>
        )}
      {sample.monoSubstances && sample.monoSubstances.length > 0 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-list-ordered')}></div>
          <div>
            {pluralize(sample.monoSubstances.length)('Analyse')} mono-résidu :{' '}
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
