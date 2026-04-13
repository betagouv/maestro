import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { toArray } from 'maestro-shared/utils/utils';
import { useContext } from 'react';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  programmingPlanId: string | undefined;
  substanceKind?: SubstanceKind;
  laboratoryId?: string | null;
  laboratoryIds?: string[];
  onSelect: (laboratoryId?: string) => void;
  readonly?: boolean;
  withAllOption?: boolean;
}

const LaboratorySelect = ({
  programmingPlanId,
  substanceKind,
  laboratoryId,
  laboratoryIds,
  onSelect,
  readonly,
  withAllOption
}: Props) => {
  const apiClient = useContext(ApiClientContext);

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({
    programmingPlanIds: toArray(programmingPlanId),
    substanceKind
  });

  const isMulti = laboratoryIds !== undefined;

  return (
    <Select
      label="Laboratoire"
      nativeSelectProps={{
        value: isMulti ? '' : (laboratoryId ?? ''),
        autoFocus: true,
        onChange: (e) => onSelect(e.target.value || undefined)
      }}
      className={cx('fr-mb-0')}
      disabled={readonly}
    >
      {(withAllOption ?? false) ? (
        <option value="">
          {isMulti && laboratoryIds.length > 0
            ? `${laboratoryIds.length} laboratoire(s)`
            : 'Tous'}
        </option>
      ) : (
        <option value="" disabled>
          Sélectionner un laboratoire
        </option>
      )}
      {sortBy(laboratories ?? [], 'name')
        .filter((lab) => !laboratoryIds?.includes(lab.id))
        .map((laboratory) => (
          <option key={laboratory.id} value={laboratory.id}>
            {laboratory.name}
          </option>
        ))}
    </Select>
  );
};

export default LaboratorySelect;
