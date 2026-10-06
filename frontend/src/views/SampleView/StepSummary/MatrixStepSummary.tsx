import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { uniq } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  isProgrammingPlanSample,
  type SampleChecked,
  type SampleOwnerData,
  type SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { getSampleMatrixLabel } from 'maestro-shared/schema/Sample/SampleMatrix';
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
    apiClient.useFindProgrammingSubPlanFieldConfigsQuery(
      {
        programmingPlanId: sample.programmingPlanId,
        programmingSubPlanId:
          sample.programmingSubPlanId as ProgrammingSubPlanId
      },
      { skip: !sample.programmingSubPlanId }
    );

  const substanceKinds = uniq(
    sample.items.flatMap(({ substanceKinds }) => substanceKinds)
  );

  return (
    <StepSummary title="Matrice contrôlée" onEdit={onEdit} mode={mode}>
      {sample.matrices.map((sampleMatrix) => (
        <div
          key={`${sampleMatrix.matrixKind}-${sampleMatrix.matrix}`}
          className="summary-item icon-text"
        >
          <div className={cx('fr-icon-restaurant-line')}></div>
          <div>
            <div>
              Catégorie de matrice programmée :{' '}
              <b>{MatrixKindLabels[sampleMatrix.matrixKind]}</b>
            </div>
            <div>
              Matrice : <b>{getSampleMatrixLabel(sampleMatrix)}</b>
            </div>
          </div>
        </div>
      ))}
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
                rawValue === UnknownValue ? (
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
      {isProgrammingPlanSample(sample) && substanceKinds.length === 0 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-list-ordered')}></div>
          <div className="missing-data">Méthode d'analyse non disponible</div>
        </div>
      )}
      {substanceKinds.map((substanceKind) => {
        const substances =
          substanceKind === 'Mono'
            ? (sample.monoSubstances ?? [])
            : substanceKind === 'Multi'
              ? (sample.multiSubstances ?? [])
              : [];

        return (
          <div key={substanceKind} className="summary-item icon-text">
            <div className={cx('fr-icon-list-ordered')}></div>
            <div>
              {substanceKind === 'Mono' &&
                `${pluralize(substances.length)('Analyse')} mono-résidu${substances.length > 0 ? ' :' : ''}`}
              {substanceKind === 'Multi' &&
                `Analyses multi-résidus${substances.length > 0 ? ' dont :' : ''}`}
              {substanceKind !== 'Mono' &&
                substanceKind !== 'Multi' &&
                SubstanceKindLabels[substanceKind]}
              {substances.length > 0 && (
                <ul>
                  {substances.map((substance) => (
                    <li key={`${substanceKind}_${substance}`}>
                      {SSD2IdLabel[substance]}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
      {sample.documentIds?.map((documentId) => (
        <div className="summary-item icon-text" key={documentId}>
          <div className={cx('fr-icon-attachment-line')}></div>
          <div className={cx('fr-col')}>
            Pièces jointes :{' '}
            <div className={cx('fr-mt-2w')}>
              <SampleDocument
                key={documentId}
                sampleId={sample.id}
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
