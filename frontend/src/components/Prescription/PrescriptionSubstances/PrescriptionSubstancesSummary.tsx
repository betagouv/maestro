import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { t } from 'i18next';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import './PrescriptionSubstances.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionSubstancesSummary = ({
  programmingPlan,
  prescription,
}: Props) => {
  const dispatch = useAppDispatch();
  const { canEditPrescriptions } = useAuthentication();

  return (
    <div className="prescription-analysis-summary">
      <div>
        <Button
          onClick={() =>
            dispatch(
              prescriptionsSlice.actions.setPrescriptionAnalysisEditId(
                prescription.id
              )
            )
          }
          priority="tertiary no outline"
          className={cx('fr-link--xs')}
        >
          {canEditPrescriptions(programmingPlan) &&
          (prescription.monoAnalysisCount ?? 0) === 0
            ? `Ajouter une analyse mono résidu`
            : `${t('analysis', {
                count: prescription.monoAnalysisCount || 0,
              })} mono résidu`}
        </Button>
      </div>
      <div>
        <Button
          onClick={() =>
            dispatch(
              prescriptionsSlice.actions.setPrescriptionAnalysisEditId(
                prescription.id
              )
            )
          }
          priority="tertiary no outline"
          className={cx('fr-link--xs')}
        >
          {canEditPrescriptions(programmingPlan) &&
          (prescription.multiAnalysisCount ?? 0) === 0
            ? `Ajouter une analyse multi résidus`
            : `${t('analysis', {
                count: prescription.multiAnalysisCount || 0,
              })} multi résidus`}
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionSubstancesSummary;
