import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import EditableNumberCell from 'src/components/EditableCell/EditableNumberCell';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  prescriptionId: string;
  programmingPlan: ProgrammingPlan;
  sampleCount: number;
  sentSampleCount: number;
  completionRate: number;
  onChange: (value: number) => void;
}

const PrescriptionCountCell = ({
  programmingPlan,
  sampleCount,
  sentSampleCount,
  completionRate,
  onChange,
}: Props) => {
  const { hasPermission } = useAuthentication();

  return hasPermission('updatePrescriptionSampleCount') &&
    programmingPlan.status === 'InProgress' ? (
    <EditableNumberCell
      initialValue={sampleCount}
      onChange={(value) => onChange(value)}
    />
  ) : (
    <>
      <div>{sampleCount}</div>
      {programmingPlan.status === 'Validated' && (
        <>
          <div>{sentSampleCount}</div>
          <div>{completionRate}%</div>
        </>
      )}
    </>
  );
};

export default PrescriptionCountCell;
