import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
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
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus,
  SampleStatusLabels,
  SampleStatusList
} from 'maestro-shared/schema/Sample/SampleStatus';
import { UserRefined } from 'maestro-shared/schema/User/User';
import {
  samplersOptions,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';

interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
  samplers?: UserRefined[];
  prescriptions?: Prescription[];
  currentUserId: string | undefined;
}

const SamplePrimaryFilters = ({
  filters,
  onChange,
  samplers,
  prescriptions,
  currentUserId
}: Props) => {
  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Catégorie de matrice"
          nativeSelectProps={{
            value: filters.matrixKind || '',
            onChange: (e) =>
              onChange({ matrixKind: e.target.value as MatrixKind })
          }}
        >
          <option value="">Toutes</option>
          {selectOptionsFromList(
            MatrixKindList.filter(
              (matrixKind) =>
                !filters.programmingPlanId ||
                (filters.contexts ?? []).length === 0 ||
                !prescriptions ||
                prescriptions.find((p) => p.matrixKind === matrixKind)
            ),
            {
              labels: MatrixKindLabels,
              withDefault: false,
              withSort: true
            }
          ).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Matrice"
          nativeSelectProps={{
            value: filters.matrix || '',
            onChange: (e) => onChange({ matrix: e.target.value as Matrix })
          }}
        >
          <option value="">Toutes</option>
          {selectOptionsFromList(
            MatrixList.filter(
              (matrix) =>
                (!filters.programmingPlanId ||
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
          ).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
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
    </div>
  );
};

export default SamplePrimaryFilters;
