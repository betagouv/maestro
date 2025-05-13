import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import {
  Stage,
  StageLabels,
  StagesByProgrammingPlanKind
} from 'maestro-shared/referential/Stage';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useState } from 'react';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  label?: string;
  onChangeStages?: (stages: Stage[]) => void;
}

const PrescriptionStages = ({
  programmingPlan,
  prescription,
  label,
  onChangeStages
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();

  const [newStage, setNewStage] = useState<Stage | ''>('');

  const removeStage = async (stage: Stage) =>
    onChangeStages?.(prescription.stages.filter((s) => s !== stage));

  const addStage = async (stage: Stage) =>
    onChangeStages?.([...prescription.stages, stage]);

  return (
    <>
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
              programmingPlan.kinds
                .flatMap((_) => StagesByProgrammingPlanKind[_])
                .filter((s) => !prescription.stages.includes(s)),
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
            onClick={async () => {
              await addStage(newStage as Stage);
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
          key={`prescription_${prescription.matrixKind}_stage_${stage}`}
          dismissible={hasUserPrescriptionPermission(programmingPlan)?.update}
          small
          nativeButtonProps={
            hasUserPrescriptionPermission(programmingPlan)?.update
              ? {
                  onClick: async () => await removeStage(stage)
                }
              : undefined
          }
          className={cx('fr-my-1v')}
        >
          {StageLabels[stage]}
        </Tag>
      ))}
    </>
  );
};

export default PrescriptionStages;
