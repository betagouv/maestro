import Button from '@codegouvfr/react-dsfr/Button';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import EditableNumberCell from 'src/components/EditableNumberCell/EditableNumberCell';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
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
  const dispatch = useAppDispatch();
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();

  return (
    <EditableNumberCell
      initialValue={regionalPrescription.sampleCount}
      isEditable={
        hasUserRegionalPrescriptionPermission(
          programmingPlan,
          regionalPrescription
        )?.updateSampleCount
      }
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
                  prescriptionsSlice.actions.setRegionalPrescriptionComments(
                    regionalPrescription
                  )
                )
              }
            ></Button>
          )}
        </div>
      }
    />
  );
};

export default RegionalPrescriptionCountCell;
