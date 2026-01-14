import Button from '@codegouvfr/react-dsfr/Button';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import EditableNumberCell from 'src/components/EditableNumberCell/EditableNumberCell';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { assert, type Equals } from 'tsafe';
import './DistributionCountCell.scss';
interface Props {
  programmingPlan: ProgrammingPlanChecked;
  prescription: Prescription;
  localPrescription: LocalPrescription;
  isEditable?: boolean;
  onChange: (value: number) => void;
  max?: number;
}

const DistributionCountCell = ({
  programmingPlan,
  prescription,
  localPrescription,
  isEditable,
  onChange,
  max,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const dispatch = useAppDispatch();

  return (
    <EditableNumberCell
      initialValue={localPrescription.sampleCount}
      isEditable={isEditable}
      onChange={(value) => onChange(value)}
      max={max}
      defaultContent={
        <div className="sample-count-container">
          <div className="sample-count">
            <div>
              {localPrescription.sampleCount}
              {(localPrescription.comments ?? []).length > 0 && (
                <Button
                  title="Consulter les commentaires"
                  iconId="fr-icon-question-answer-fill"
                  size="small"
                  priority="tertiary no outline"
                  className="comments-button"
                  onClick={() =>
                    dispatch(
                      prescriptionsSlice.actions.setPrescriptionCommentsData({
                        viewBy: 'Prescription',
                        programmingPlan,
                        prescription,
                        currentRegion: localPrescription.region,
                        regionalCommentsList: [localPrescription].map(
                          (rcp) => ({
                            region: rcp.region,
                            department: rcp.department,
                            comments: rcp.comments ?? []
                          })
                        )
                      })
                    )
                  }
                ></Button>
              )}
            </div>
            {programmingPlan.regionalStatus.some(
              (_) =>
                _.region === localPrescription.region &&
                _.status === 'Validated'
            ) && (
              <>
                <div>{localPrescription.realizedSampleCount}</div>
                <CompletionBadge localPrescriptions={localPrescription} />
              </>
            )}
          </div>
        </div>
      }
    />
  );
};

export default DistributionCountCell;
