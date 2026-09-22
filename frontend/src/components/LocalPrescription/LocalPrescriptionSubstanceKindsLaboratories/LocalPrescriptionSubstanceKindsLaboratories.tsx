import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import type { ProgrammingPlanSampleSetting } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  assignSampleLaboratory,
  groupSubstanceKindsLaboratoriesBySample
} from '../../../utils/sampleLaboratories';
import LaboratorySelect from '../../LaboratorySelect/LaboratorySelect';

interface Props {
  programmingPlanId: string;
  programmingSubPlanId: ProgrammingSubPlanId;
  samples: ProgrammingPlanSampleSetting[] | null;
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
      programmingSubPlanId,
      samples,
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

    const sampleLaboratories = groupSubstanceKindsLaboratoriesBySample(
      samples,
      substanceKindsLaboratories
    );

    return (
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          Définissez le laboratoire destinataire des prélèvements{' '}
          {sampleLaboratories.length > 1 && <>par échantillon</>}
        </div>
        {sampleLaboratories.map((sampleLaboratory, index) => (
          <div
            className={cx('fr-col-12')}
            key={`sampleLaboratory_${sampleLaboratory.substanceKinds.join('_')}`}
          >
            {index > 0 && <hr className={cx('fr-mb-2w')} />}
            <div className={cx('fr-text--bold', 'fr-mb-2w')}>
              {sampleLaboratory.substanceKinds
                .map((substanceKind) => SubstanceKindLabels[substanceKind])
                .join(', ')}
            </div>
            <LaboratorySelect
              programmingPlanId={programmingPlanId}
              programmingSubPlanId={programmingSubPlanId}
              substanceKinds={sampleLaboratory.substanceKinds}
              laboratoryId={sampleLaboratory.laboratoryId}
              onSelect={(laboratoryId) =>
                setSubstanceKindsLaboratories(
                  assignSampleLaboratory(
                    substanceKindsLaboratories,
                    sampleLaboratory.substanceKinds,
                    laboratoryId
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
