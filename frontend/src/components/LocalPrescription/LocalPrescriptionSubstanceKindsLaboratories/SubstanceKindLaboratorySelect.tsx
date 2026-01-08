import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext } from 'react';
import { ApiClientContext } from '../../../services/apiClient';

interface Props {
  programmingPlanId: string;
  substanceKindLaboratory: SubstanceKindLaboratory;
  onSelect: (laboratoryId?: string) => void;
}

const SubstanceKindLaboratorySelect = ({
  programmingPlanId,
  substanceKindLaboratory,
  onSelect
}: Props) => {
  const apiClient = useContext(ApiClientContext);

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({
    programmingPlanId,
    substanceKind: substanceKindLaboratory.substanceKind
  });

  return (
    <>
      <div className={cx('fr-text--bold', 'fr-mb-2w')}>
        {SubstanceKindLabels[substanceKindLaboratory.substanceKind]}
      </div>
      <Select
        label="Laboratoire"
        nativeSelectProps={{
          value: substanceKindLaboratory.laboratoryId ?? '',
          autoFocus: true,
          onChange: (e) => onSelect(e.target.value || undefined)
        }}
        className={cx('fr-mb-0')}
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
    </>
  );
};

export default SubstanceKindLaboratorySelect;
