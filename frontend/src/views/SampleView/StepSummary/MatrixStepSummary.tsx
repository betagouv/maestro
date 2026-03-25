import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import {
  getSampleMatrixLabel,
  isProgrammingPlanSample,
  type SampleChecked,
  type SampleOwnerData,
  type SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { getFieldValueLabel } from 'maestro-shared/schema/SpecificData/getFieldValueLabel';
import {
  type SpecificData,
  UnknownValue
} from 'maestro-shared/schema/SpecificData/SpecificData';

import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext } from 'react';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { ApiClientContext } from 'src/services/apiClient';
import { pluralize, quote } from 'src/utils/stringUtils';
import StepSummary, {
  type StepSummaryMode
} from 'src/views/SampleView/StepSummary/StepSummary';
import AppRequiredInput from '../../../components/_app/AppRequired/AppRequiredInput';
import SampleDocument from '../../../components/Sample/SampleDocument/SampleDocument';

interface Props {
  sample: (SampleChecked | SampleToCreate) & Partial<SampleOwnerData>;
  mode?: StepSummaryMode;
  onEdit?: () => void;
  onUpdateSpecificData?: (specificData: SpecificData) => void;
}
const MatrixStepSummary = ({
  sample,
  mode = 'section',
  onEdit,
  onUpdateSpecificData
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { data: fieldConfigs = [] } =
    apiClient.useFindPlanKindFieldConfigsQuery({
      programmingPlanId: sample.programmingPlanId,
      kind: sample.programmingPlanKind
    });

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

      {fieldConfigs.map((fc) => {
        const { field } = fc;
        const inputKey = field.key;
        const rawValue = (sample.specificData as any)[inputKey];
        const value = getFieldValueLabel(field, rawValue);
        if (!value) {
          return null;
        }

        return (
          <div key={inputKey} className="summary-item icon-text">
            <div className={cx('fr-mr-9v')}></div>
            <div>
              {field.inputType === 'checkbox' ? (
                <b>{value}</b>
              ) : field.inputType === 'selectWithUnknown' &&
                value === UnknownValue ? (
                <>
                  {field.label}
                  <AppRequiredInput />{' '}
                  <Select
                    label=""
                    nativeSelectProps={{
                      value: (sample.specificData[inputKey] as string) ?? '',
                      onChange: (e) =>
                        onUpdateSpecificData?.({
                          ...sample.specificData,
                          [inputKey]:
                            e.target.value === ''
                              ? UnknownValue
                              : e.target.value
                        })
                    }}
                  >
                    {selectOptionsFromList(
                      [...field.options]
                        .sort((a, b) => a.order - b.order)
                        .map((o) => o.value),
                      {
                        labels: Object.fromEntries(
                          field.options.map((o) => [o.value, o.label])
                        )
                      }
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </>
              ) : (
                <>
                  {field.label} : <b>{value}</b>
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
            {pluralize(sample.monoSubstances.length)('Analyse')} mono-résidu :
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
            Analyses multi-résidus dont :
            <ul>
              {sample.multiSubstances.map((substance) => (
                <li key={`Multi_${substance}`}>{SSD2IdLabel[substance]}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {sample.items
        .filter(
          ({ substanceKind }) =>
            !['Any', 'Multi', 'Mono'].includes(substanceKind)
        )
        .map(({ substanceKind }) => (
          <div key={substanceKind} className="summary-item icon-text">
            <div className={cx('fr-icon-list-ordered')}></div>
            <div>{SubstanceKindLabels[substanceKind]}</div>
          </div>
        ))}
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
