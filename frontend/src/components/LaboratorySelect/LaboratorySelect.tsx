import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext } from 'react';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  programmingPlanId: string | undefined;
  substanceKind?: SubstanceKind;
  laboratoryId?: string | null;
  onSelect: (laboratoryId?: string) => void;
  readonly?: boolean;
}

const LaboratorySelect = ({
  programmingPlanId,
  substanceKind,
  laboratoryId,
  onSelect,
  readonly
}: Props) => {
  const apiClient = useContext(ApiClientContext);

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({
    programmingPlanId,
    substanceKind
  });

  return (
    <Select
      label="Laboratoire"
      nativeSelectProps={{
        value: laboratoryId ?? '',
        autoFocus: true,
        onChange: (e) => onSelect(e.target.value || undefined)
      }}
      className={cx('fr-mb-0')}
      disabled={readonly}
    >
      <option value="" disabled>
        Sélectionner un laboratoire
      </option>
      {sortBy(laboratories ?? [], 'name').map((laboratory) => (
        <option key={laboratory.id} value={laboratory.id}>
          {laboratory.name}
        </option>
      ))}
    </Select>
  );
};

export default LaboratorySelect;
