import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import { difference } from 'lodash-es';
import { Matrix, MatrixList } from 'maestro-shared/referential/Matrix/Matrix';
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
import { User } from 'maestro-shared/schema/User/User';
import {
  samplersOptions,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';
import { useAppSelector } from '../../hooks/useStore';

interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
  samplers?: User[];
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
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
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
                !filters.programmingPlanId ||
                !filters.context ||
                !prescriptions ||
                prescriptions.find((p) =>
                  MatrixListByKind[p.matrixKind].includes(matrix)
                )
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

      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Input
          label="Date"
          nativeInputProps={{
            type: 'date',
            value: filters.sampledAt ?? '',
            min: `${programmingPlan?.year}-01-01`,
            max: `${programmingPlan?.year}-12-31`,
            onChange: (e) => onChange({ sampledAt: e.target.value })
          }}
        />
      </div>
    </div>
  );
};

export default SamplePrimaryFilters;
