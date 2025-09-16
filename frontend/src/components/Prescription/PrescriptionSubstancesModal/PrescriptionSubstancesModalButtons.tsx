import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { pluralize } from 'src/utils/stringUtils';
import './PrescriptionSubstances.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionSubstancesModalButtons = ({
  programmingPlan,
  prescription
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserPrescriptionPermission } = useAuthentication();

  return (
    <div className="prescription-substance-button">
      <div>
        <Button
          onClick={() =>
            dispatch(
              prescriptionsSlice.actions.setPrescriptionAnalysisEdit(
                prescription
              )
            )
          }
          priority="tertiary no outline"
          className={clsx(cx('fr-link--xs'), 'link-underline')}
        >
          {hasUserPrescriptionPermission(programmingPlan)?.update &&
          (prescription.monoAnalysisCount ?? 0) === 0
            ? `Ajouter une analyse mono résidu`
            : `${t('analysis', {
                count: prescription.monoAnalysisCount || 0
              })} mono résidu`}
        </Button>
      </div>
      <div>
        <Button
          onClick={() =>
            dispatch(
              prescriptionsSlice.actions.setPrescriptionAnalysisEdit(
                prescription
              )
            )
          }
          priority="tertiary no outline"
          className={clsx(cx('fr-link--xs'), 'link-underline')}
        >
          {hasUserPrescriptionPermission(programmingPlan)?.update &&
          (prescription.multiAnalysisCount ?? 0) === 0
            ? `Spécifier une analyse multi résidus`
            : `Analyse multi-résidu (${prescription.multiAnalysisCount || 0} ${pluralize(
                prescription.multiAnalysisCount || 0
              )('spécifiée')})`}
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionSubstancesModalButtons;
