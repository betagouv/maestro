import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { t } from 'i18next';
import { difference } from 'lodash-es';
import { Matrix, MatrixList } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindList
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus,
  SampleStatusLabels,
  SampleStatusList
} from 'maestro-shared/schema/Sample/SampleStatus';
import { UserRefined } from 'maestro-shared/schema/User/User';
import AppSearchInput from 'src/components/_app/AppSearchInput/AppSearchInput';
import {
  samplersOptions,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';
import { pluralize } from '../../utils/stringUtils';
interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
  programmingPlans?: ProgrammingPlanChecked[];
  samplers?: UserRefined[];
  prescriptions?: Prescription[];
  currentUserId: string | undefined;
}

const SamplePrimaryFilters = ({
  filters,
  onChange,
  programmingPlans,
  samplers,
  prescriptions,
  currentUserId
}: Props) => {
  return (
    <>
      {(programmingPlans?.length ?? 0) > 1 && (
        <>
          <div className={cx('fr-col-12', 'fr-col-md-3')}>
            <Select
              label="Plan"
              nativeSelectProps={{
                value: '',
                onChange: (e) =>
                  onChange({
                    programmingPlanIds: [
                      ...(filters.programmingPlanIds ?? []),
                      e.target.value as string
                    ]
                  })
              }}
            >
              <option value="">
                {filters.programmingPlanIds?.length
                  ? t('programmingPlan', {
                      count: filters.programmingPlanIds?.length
                    })
                  : 'Tous'}
              </option>
              {programmingPlans
                ?.filter(
                  (plan) => !filters.programmingPlanIds?.includes(plan.id)
                )
                .map((plan) => (
                  <option key={`plan-${plan.id}`} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
            </Select>
          </div>
          <div className={cx('fr-col-12', 'fr-col-md-3')}>
            <Select
              label="Sous-plan"
              nativeSelectProps={{
                value: '',
                onChange: (e) =>
                  onChange({
                    kinds: [
                      ...(filters.kinds ?? []),
                      e.target.value as ProgrammingPlanKind
                    ]
                  })
              }}
            >
              <option value="">
                {filters.kinds?.length
                  ? pluralize(filters.kinds.length, {
                      preserveCount: true
                    })('sous-plan')
                  : 'Tous'}
              </option>
              {ProgrammingPlanKindList.filter(
                (kind) =>
                  (filters.programmingPlanIds ?? []).length === 0 ||
                  (filters.programmingPlanIds ?? []).some((id) =>
                    programmingPlans
                      ?.find((plan) => plan.id === id)
                      ?.kinds.includes(kind)
                  )
              )
                .filter((kind) => !filters.kinds?.includes(kind))
                .map((kind) => (
                  <option key={`programmingPlanKind-${kind}`} value={kind}>
                    {ProgrammingPlanKindLabels[kind]}
                  </option>
                ))}
            </Select>
          </div>
        </>
      )}
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <AppSearchInput
          value={filters.matrixKind || ''}
          options={selectOptionsFromList(
            MatrixKindList.filter(
              (matrixKind) =>
                (filters.programmingPlanIds ?? []).length === 0 ||
                (filters.contexts ?? []).length === 0 ||
                !prescriptions ||
                prescriptions.find((p) => p.matrixKind === matrixKind)
            ),
            {
              labels: MatrixKindLabels,
              withDefault: false,
              withSort: true
            }
          )}
          placeholder="Sélectionner une catégorie"
          onSelect={(value) => {
            onChange({ matrixKind: value as MatrixKind });
          }}
          label="Catégorie de matrice"
          renderOption={(props, option) => (
            <li {...props} key={option.value}>
              {option.label}
            </li>
          )}
        />
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <AppSearchInput
          value={filters.matrix ?? ''}
          options={selectOptionsFromList(
            MatrixList.filter(
              (matrix) =>
                ((filters.programmingPlanIds ?? []).length === 0 ||
                  (filters.contexts ?? []).length === 0 ||
                  !prescriptions ||
                  prescriptions.find((p) =>
                    MatrixListByKind[p.matrixKind].includes(matrix)
                  )) &&
                (!filters.matrixKind ||
                  MatrixListByKind[filters.matrixKind].includes(matrix))
            ),
            {
              labels: MatrixLabels,
              withDefault: false
            }
          )}
          placeholder="Sélectionner une matrice"
          onSelect={(value) => {
            onChange({ matrix: value as Matrix });
          }}
          label="Matrice"
          inputProps={{
            'data-testid': 'matrix-select'
          }}
          renderOption={(props, option) => (
            <li {...props} key={option.value}>
              {option.label}
            </li>
          )}
        />
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Statut"
          nativeSelectProps={{
            value: filters.status || '',
            onChange: (e) =>
              onChange({
                status: e.target.value as SampleStatus
              })
          }}
        >
          <option value="">Tous</option>
          <option value={DraftStatusList.join(',')}>Brouillon</option>
          {difference(SampleStatusList, DraftStatusList).map((status) => (
            <option key={`status-${status}`} value={status}>
              {SampleStatusLabels[status]}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Préleveur"
          nativeSelectProps={{
            value: filters.sampledBy || '',
            onChange: (e) => onChange({ sampledBy: e.target.value })
          }}
        >
          <option value="">Tous</option>
          {samplersOptions(samplers, currentUserId).map((option) => (
            <option key={`sampler-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </>
  );
};

export default SamplePrimaryFilters;
