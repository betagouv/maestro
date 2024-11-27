import Button from '@codegouvfr/react-dsfr/Button';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription
} from 'shared/schema/RegionalPrescription/RegionalPrescription';
import EditableNumberCell from 'src/components/EditableCell/EditableNumberCell';
import RegionalPrescriptionCommentsModal from 'src/components/Prescription/RegionalPrescriptionCommentsModal/RegionalPrescriptionCommentsModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import './RegionalPrescriptionCountCell.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  regionalPrescription: RegionalPrescription;
  onChange: (value: number) => void;
}

const RegionalPrescriptionCountCell = ({
  programmingPlan,
  regionalPrescription,
  onChange
}: Props) => {
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();

  return hasUserRegionalPrescriptionPermission(
    programmingPlan,
    regionalPrescription
  )?.updateSampleCount ? (
    <EditableNumberCell
      initialValue={regionalPrescription.sampleCount}
      onChange={(value) => onChange(value)}
    />
  ) : (
    <>
      <div className="d-flex-align-center">
        <div className="sample-count">{regionalPrescription.sampleCount}</div>
        {(regionalPrescription.comments ?? []).length > 0 && (
          <RegionalPrescriptionCommentsModal
            programmingPlanId={programmingPlan.id}
            regionalPrescription={regionalPrescription}
            modalButton={
              <Button
                title="Consulter les commentaires"
                iconId="fr-icon-question-answer-fill"
                size="small"
                priority="tertiary no outline"
              ></Button>
            }
          />
        )}
      </div>
      {programmingPlan.status === 'Validated' && (
        <>
          <div>{regionalPrescription.realizedSampleCount}</div>
          <div>{getCompletionRate(regionalPrescription)}%</div>
        </>
      )}
    </>
  );
};

export default RegionalPrescriptionCountCell;
