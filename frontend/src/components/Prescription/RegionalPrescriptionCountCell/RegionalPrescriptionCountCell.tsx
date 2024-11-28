import Button from '@codegouvfr/react-dsfr/Button';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription
} from 'shared/schema/RegionalPrescription/RegionalPrescription';
import EditableNumberCell from 'src/components/EditableCell/EditableNumberCell';
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
        <div className="d-flex-align-center">
          <div>
            <div className="sample-count">
              {regionalPrescription.sampleCount}
            </div>
            {programmingPlan.status === 'Validated' && (
              <>
                <div>{regionalPrescription.realizedSampleCount}</div>
                <div>{getCompletionRate(regionalPrescription)}%</div>
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
