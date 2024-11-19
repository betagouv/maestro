import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { useMemo } from 'react';
import { StageLabels } from 'shared/referential/Stage';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useUpdatePrescriptionMutation } from 'src/services/prescription.service';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionStages = ({ programmingPlan, prescription }: Props) => {
  const { hasPermission } = useAuthentication();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();

  const canEdit = useMemo(
    () =>
      hasPermission('updatePrescription') &&
      programmingPlan.status !== 'Validated',
    [hasPermission, programmingPlan.status]
  );

  const removeStage = async (stage: number) => {
    if (canEdit) {
      // TODO
      // await updatePrescription({
      //   prescriptionId,
      //   prescriptionUpdate: {
      //     programmingPlanId,
      //     context: findPrescriptionOptions.context,
      //     sampleCount: count,
      //   },
      // });
    }
  };

  return (
    <>
      <div className={cx('fr-text--md', 'fr-mb-0')}>Stades de prélèvement</div>
      {prescription.stages.map((stage) => (
        <Tag
          key={`prescription_${prescription.matrix}_stage_${stage}`}
          dismissible={canEdit}
          nativeButtonProps={
            canEdit
              ? {
                  onClick: function noRefCheck() {},
                }
              : undefined
          }
        >
          {StageLabels[stage]}
        </Tag>
      ))}
    </>
  );
};

export default PrescriptionStages;
