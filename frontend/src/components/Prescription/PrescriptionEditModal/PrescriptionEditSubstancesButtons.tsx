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
import './PrescriptionEditModal.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionEditSubstancesButtons = ({
  programmingPlan,
  prescription
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserPrescriptionPermission } = useAuthentication();

  return (
    <div className="prescription-substance-button">
      <div className={cx('fr-text--bold', 'fr-mb-1w', 'fr-ml-2w')}>
        Au programme :
      </div>
      <div>
        <Button
          onClick={() =>
            dispatch(
              prescriptionsSlice.actions.setPrescriptionEditData({
                mode: 'analysis',
                programmingPlan,
                prescription
              })
            )
          }
          priority="tertiary no outline"
          iconId={
            (prescription.monoAnalysisCount ?? 0) === 0
              ? 'fr-icon-add-line'
              : 'fr-icon-check-line'
          }
          className={clsx(cx('fr-text--regular'), 'link-underline')}
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
              prescriptionsSlice.actions.setPrescriptionEditData({
                mode: 'analysis',
                programmingPlan,
                prescription
              })
            )
          }
          priority="tertiary no outline"
          iconId={
            (prescription.multiAnalysisCount ?? 0) === 0
              ? 'fr-icon-add-line'
              : 'fr-icon-check-line'
          }
          className={clsx(cx('fr-text--regular'), 'link-underline')}
        >
          {hasUserPrescriptionPermission(programmingPlan)?.update &&
          (prescription.multiAnalysisCount ?? 0) === 0
            ? `Spécifier une analyse multi résidus`
            : `Analyse multi-résidu (${prescription.multiAnalysisCount || 0} ${pluralize(
                prescription.multiAnalysisCount || 0
              )('spécifiée')})`}
        </Button>
      </div>
      {programmingPlan.additionalSubstances?.map((substance, index) => (
        <div
          key={`additionalSubstance-${index}`}
          className={clsx(cx('fr-py-1w', 'fr-px-2w'), 'flex-align-center')}
        >
          <span
            className={cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1w')}
          />
          {substance}
        </div>
      ))}
    </div>
  );
};

export default PrescriptionEditSubstancesButtons;
