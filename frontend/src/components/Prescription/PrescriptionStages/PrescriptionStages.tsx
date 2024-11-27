import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { useState } from 'react';
import { Stage, StageLabels, StageList } from 'shared/referential/Stage';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useUpdatePrescriptionMutation } from 'src/services/prescription.service';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  label?: string;
}

const PrescriptionStages = ({
  programmingPlan,
  prescription,
  label
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();

  const [newStage, setNewStage] = useState<Stage | ''>('');

  const removeStage = async (stage: Stage) => {
    if (hasUserPrescriptionPermission(programmingPlan)?.update) {
      await updatePrescription({
        prescriptionId: prescription.id,
        prescriptionUpdate: {
          programmingPlanId: prescription.programmingPlanId,
          stages: prescription.stages.filter((s) => s !== stage)
        }
      });
    }
  };

  const addStage = async (stage: Stage) => {
    if (hasUserPrescriptionPermission(programmingPlan)?.update) {
      await updatePrescription({
        prescriptionId: prescription.id,
        prescriptionUpdate: {
          programmingPlanId: prescription.programmingPlanId,
          stages: [...prescription.stages, stage]
        }
      });
    }
  };

  return (
    <>
      <AppToast open={isUpdateSuccess} description="Modification enregistrée" />
      {hasUserPrescriptionPermission(programmingPlan)?.update ? (
        <div className="d-flex-align-center">
          <Select
            label={label ?? ''}
            nativeSelectProps={{
              onChange: (e) => {
                setNewStage(e.target.value as Stage);
              }
            }}
            className={cx('fr-mb-1w')}
          >
            {selectOptionsFromList(
              StageList.filter((s) => !prescription.stages.includes(s)),
              {
                defaultLabel: 'Sélectionner',
                labels: StageLabels,
                withSort: true
              }
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            iconId="fr-icon-add-line"
            priority="secondary"
            title="Ajouter"
            disabled={!newStage}
            onClick={() => {
              addStage(newStage as Stage);
              setNewStage('');
            }}
            className={cx(label ? 'fr-mt-3w' : 'fr-mb-1w', 'fr-ml-2w')}
          />
        </div>
      ) : (
        <label className={cx('fr-label')}>{label}</label>
      )}
      {prescription.stages.map((stage) => (
        <Tag
          key={`prescription_${prescription.matrix}_stage_${stage}`}
          dismissible={hasUserPrescriptionPermission(programmingPlan)?.update}
          small
          nativeButtonProps={
            hasUserPrescriptionPermission(programmingPlan)?.update
              ? {
                  onClick: () => removeStage(stage)
                }
              : undefined
          }
          className={cx('fr-m-1v')}
        >
          {StageLabels[stage]}
        </Tag>
      ))}
    </>
  );
};

export default PrescriptionStages;
