import Button from '@codegouvfr/react-dsfr/Button';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import EditableNumberCell from 'src/components/EditableCell/EditableNumberCell';
import PrescriptionCommentsModal from 'src/components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import './PrescriptionCountCell.scss';
interface Props extends Pick<Prescription, 'comments'> {
  programmingPlan: ProgrammingPlan;
  prescriptionId: string;
  samplesCount: number;
  sentSamplesCount: number;
  completionRate: number;
  onChange: (value: number) => void;
}

const PrescriptionCountCell = ({
  programmingPlan,
  prescriptionId,
  samplesCount,
  sentSamplesCount,
  completionRate,
  comments,
  onChange,
}: Props) => {
  const { hasPermission } = useAuthentication();

  return hasPermission('updatePrescriptionSampleCount') &&
    programmingPlan.status === 'InProgress' ? (
    <EditableNumberCell
      initialValue={samplesCount}
      onChange={(value) => onChange(value)}
    />
  ) : (
    <>
      <div className="d-flex-align-center">
        <div className="sample-count">{samplesCount}</div>
        {(comments ?? []).length > 0 && (
          <PrescriptionCommentsModal
            programmingPlanId={programmingPlan.id}
            prescriptionId={prescriptionId}
            comments={comments}
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
          <div>{sentSamplesCount}</div>
          <div>{completionRate}%</div>
        </>
      )}
    </>
  );
};

export default PrescriptionCountCell;
