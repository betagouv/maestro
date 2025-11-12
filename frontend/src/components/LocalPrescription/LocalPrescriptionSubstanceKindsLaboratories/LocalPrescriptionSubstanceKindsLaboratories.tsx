import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import {
  SubstanceKindLaboratory,
  SubstanceKindLaboratorySort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { forwardRef, useContext, useImperativeHandle, useState } from 'react';
import { ApiClientContext } from '../../../services/apiClient';

interface Props {
  substanceKindsLaboratories: SubstanceKindLaboratory[];
  onSubmit: (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => Promise<void>;
}

const LocalPrescriptionSubstanceKindsLaboratories = forwardRef<
  { submit: () => void },
  Props
>(
  (
    { substanceKindsLaboratories: defaultSubstanceKindsLaboratories, onSubmit },
    ref
  ) => {
    const apiClient = useContext(ApiClientContext);
    const [substanceKindsLaboratories, setSubstanceKindsLaboratories] =
      useState<SubstanceKindLaboratory[]>(defaultSubstanceKindsLaboratories);

    const { data: laboratories } = apiClient.useFindLaboratoriesQuery();

    useImperativeHandle(ref, () => ({
      submit: async () => onSubmit(substanceKindsLaboratories)
    }));

    return (
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          Définissez le laboratoire destinataire des prélèvements{' '}
          {substanceKindsLaboratories.length > 1 && <>par type d’analyse</>}
        </div>
        {[...substanceKindsLaboratories]
          .sort(SubstanceKindLaboratorySort)
          .map((substanceKindLaboratory, index) => (
            <div
              className={cx('fr-col-12')}
              key={`substanceKindLaboratory_${substanceKindLaboratory.substanceKind}`}
            >
              {index > 0 && <hr className={cx('fr-mb-2w')} />}
              <div className={cx('fr-text--bold', 'fr-mb-2w')}>
                {SubstanceKindLabels[substanceKindLaboratory.substanceKind]}
              </div>
              <Select
                label="Laboratoire"
                nativeSelectProps={{
                  value: substanceKindLaboratory.laboratoryId ?? '',
                  autoFocus: true,
                  onChange: (e) =>
                    setSubstanceKindsLaboratories(
                      substanceKindsLaboratories.map((sl) =>
                        sl.substanceKind ===
                        substanceKindLaboratory.substanceKind
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
  }
);

export default LocalPrescriptionSubstanceKindsLaboratories;
