import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  type SubstanceKindLaboratory,
  SubstanceKindLaboratorySort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { forwardRef, useImperativeHandle, useState } from 'react';
import LaboratorySelect from '../../LaboratorySelect/LaboratorySelect';

interface Props {
  programmingPlanId: string;
  substanceKindsLaboratories: SubstanceKindLaboratory[];
  onSubmit: (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => Promise<void>;
  readonly?: boolean;
}

const LocalPrescriptionSubstanceKindsLaboratories = forwardRef<
  { submit: () => void },
  Props
>(
  (
    {
      programmingPlanId,
      substanceKindsLaboratories: defaultSubstanceKindsLaboratories,
      onSubmit,
      readonly
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
              <div className={cx('fr-text--bold', 'fr-mb-2w')}>
                {SubstanceKindLabels[substanceKindLaboratory.substanceKind]}
              </div>
              <LaboratorySelect
                programmingPlanId={programmingPlanId}
                substanceKind={substanceKindLaboratory.substanceKind}
                laboratoryId={substanceKindLaboratory.laboratoryId}
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
                readonly={readonly}
              />
            </div>
          ))}
      </div>
    );
  }
);

export default LocalPrescriptionSubstanceKindsLaboratories;
