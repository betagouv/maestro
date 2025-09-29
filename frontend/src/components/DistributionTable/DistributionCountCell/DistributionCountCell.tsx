import Button from '@codegouvfr/react-dsfr/Button';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import EditableNumberCell from 'src/components/EditableNumberCell/EditableNumberCell';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { assert, type Equals } from 'tsafe';
import './DistributionCountCell.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  matrixKind: MatrixKind;
  regionalPrescription: RegionalPrescription;
  isEditable?: boolean;
  onChange: (value: number) => void;
}

const DistributionCountCell = ({
  programmingPlan,
  matrixKind,
  regionalPrescription,
  isEditable,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const dispatch = useAppDispatch();

  return (
    <EditableNumberCell
      initialValue={regionalPrescription.sampleCount}
      isEditable={isEditable}
      onChange={(value) => onChange(value)}
      defaultContent={
        <div className="sample-count-container">
          <div className="sample-count">
            <div>{regionalPrescription.sampleCount}</div>
            {programmingPlan.regionalStatus.find(
              (_) => _.region === regionalPrescription.region
            )?.status === 'Validated' && (
              <>
                <div>{regionalPrescription.realizedSampleCount}</div>
                <CompletionBadge regionalPrescriptions={regionalPrescription} />
              </>
            )}
          </div>
          {(regionalPrescription.comments ?? []).length > 0 && (
            <Button
              title="Consulter les commentaires"
              iconId="fr-icon-question-answer-fill"
              size="small"
              priority="tertiary no outline"
              className="comments-button"
              onClick={() =>
                dispatch(
                  prescriptionsSlice.actions.setPrescriptionCommentsData({
                    viewBy: 'MatrixKind',
                    programmingPlan,
                    prescriptionId: regionalPrescription.prescriptionId,
                    matrixKind,
                    regionalComments: [regionalPrescription].map((rcp) => ({
                      region: rcp.region,
                      comments: rcp.comments ?? []
                    }))
                  })
                )
              }
            ></Button>
          )}
        </div>
      }
    />
  );
};

export default DistributionCountCell;
