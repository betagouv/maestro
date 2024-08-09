import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import { default as _ } from 'lodash';
import { Matrix, MatrixList } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus,
  SampleStatusLabels,
  SampleStatusList,
} from 'shared/schema/Sample/SampleStatus';
import { UserInfos } from 'shared/schema/User/User';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';

interface Props {
  filters: FindSampleOptions;
  onChange: (filters: FindSampleOptions) => void;
  samplers?: UserInfos[];
  prescriptions?: Prescription[];
}

const SamplePrimaryFilters = ({
  filters,
  onChange,
  samplers,
  prescriptions,
}: Props) => {
  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Matrice"
          nativeSelectProps={{
            value: filters.matrix || '',
            onChange: (e) => onChange({ matrix: e.target.value as Matrix }),
          }}
        >
          <option value="">Toutes</option>
          {selectOptionsFromList(
            MatrixList.filter(
              (matrix) =>
                !filters.programmingPlanId ||
                !prescriptions ||
                prescriptions.find((p) => p.matrix === matrix)
            ),
            {
              labels: MatrixLabels,
              withDefault: false,
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
                status: e.target.value as SampleStatus,
              }),
          }}
        >
          <option value="">Tous</option>
          <option value={DraftStatusList.join(',')}>Brouillon</option>
          {_.difference(SampleStatusList, DraftStatusList).map((status) => (
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
            onChange: (e) => onChange({ sampledBy: e.target.value }),
          }}
        >
          <option value="">Tous</option>
          {samplers?.map((user) => (
            <option key={`user-${user.id}`} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </Select>
      </div>

      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Input
          label="Date"
          nativeInputProps={{
            value: filters.sampledAt ?? '',
            type: 'date',
            onChange: (e) => onChange({ sampledAt: e.target.value }),
          }}
        />
      </div>
    </div>
  );
};

export default SamplePrimaryFilters;
