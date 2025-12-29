import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  SubstanceKindLaboratory,
  SubstanceKindLaboratorySort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { forwardRef, useImperativeHandle, useState } from 'react';
import SubstanceKindLaboratorySelect from './SubstanceKindLaboratorySelect';

interface Props {
  programmingPlanId: string;
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
    {
      programmingPlanId,
      substanceKindsLaboratories: defaultSubstanceKindsLaboratories,
      onSubmit
    },
    ref
  ) => {
    const [substanceKindsLaboratories, setSubstanceKindsLaboratories] =
      useState<SubstanceKindLaboratory[]>(defaultSubstanceKindsLaboratories);

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
              <SubstanceKindLaboratorySelect
                programmingPlanId={programmingPlanId}
                substanceKindLaboratory={substanceKindLaboratory}
                onSelect={(laboratoryId) =>
                  setSubstanceKindsLaboratories(
                    substanceKindsLaboratories.map((sl) =>
                      sl.substanceKind === substanceKindLaboratory.substanceKind
                        ? {
                            ...sl,
                            laboratoryId
                          }
                        : sl
                    )
                  )
                }
              />
            </div>
          ))}
      </div>
    );
  }
);

export default LocalPrescriptionSubstanceKindsLaboratories;
