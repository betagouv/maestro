import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  SubstanceKindLaboratory,
  SubstanceKindLaboratorySort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { forwardRef, useContext, useImperativeHandle, useState } from 'react';
import { ApiClientContext } from '../../../services/apiClient';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlan;
  localPrescription: LocalPrescription;
  onSubmit: (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => Promise<void>;
}

const LocalPrescriptionSubstanceKindsLaboratories = forwardRef<
  { submit: () => void },
  Props
>(({ programmingPlan, localPrescription, onSubmit }, ref) => {
  const apiClient = useContext(ApiClientContext);
  const [substanceKindsLaboratories, setSubstanceKindsLaboratories] = useState<
    SubstanceKindLaboratory[]
  >(
    (localPrescription.substanceKindsLaboratories ?? []).length > 0
      ? (localPrescription.substanceKindsLaboratories as SubstanceKindLaboratory[])
      : programmingPlan.distributionKind === 'REGIONAL'
        ? [
            {
              substanceKind: 'Any'
            }
          ]
        : [
            {
              substanceKind: 'Mono'
            },
            {
              substanceKind: 'Multi'
            },
            {
              substanceKind: 'Copper' //TODO lien avec additionalSubstance
            }
          ]
  );

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery();

  useImperativeHandle(ref, () => ({
    submit: async () => onSubmit(substanceKindsLaboratories)
  }));

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12')}>
        Définissez{' '}
        {pluralize(substanceKindsLaboratories.length)(
          'le laboratoire destinataire'
        )}{' '}
        des prélèvements
      </div>
      {[...substanceKindsLaboratories]
        .sort(SubstanceKindLaboratorySort)
        .map((substanceKindLaboratory) => (
          <div
            className={cx('fr-col-12')}
            key={`substanceKindLaboratory_${localPrescription.prescriptionId}_${substanceKindLaboratory.substanceKind}`}
          >
            <Select
              label={SubstanceKindLabels[substanceKindLaboratory.substanceKind]}
              nativeSelectProps={{
                value: substanceKindLaboratory.laboratoryId ?? '',
                autoFocus: true,
                onChange: (e) =>
                  setSubstanceKindsLaboratories(
                    substanceKindsLaboratories.map((sl) =>
                      sl.substanceKind === substanceKindLaboratory.substanceKind
                        ? {
                            ...sl,
                            laboratoryId: e.target.value
                          }
                        : sl
                    )
                  )
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
          </div>
        ))}
    </div>
  );
});

export default LocalPrescriptionSubstanceKindsLaboratories;
