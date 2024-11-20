import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { t } from 'i18next';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionAnalysisModal from 'src/components/Prescription/PrescriptionAnalysis/PrescriptionAnalysisModal';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionAnalysis = ({ programmingPlan, prescription }: Props) => {
  const { canEditPrescriptions } = useAuthentication();

  return (
    <PrescriptionAnalysisModal
      programmingPlan={programmingPlan}
      prescription={prescription}
      onSubmit={(matrix) => {
        console.log(matrix);
      }}
      modalButtons={[
        <Button priority="tertiary no outline" className={cx('fr-link--sm')}>
          {canEditPrescriptions(programmingPlan) &&
          (prescription.monoAnalysisCount ?? 0) === 0
            ? `Ajouter une analyse mono résidu`
            : `${t('analysis', {
                count: prescription.monoAnalysisCount || 0,
              })} mono résidu`}
        </Button>,
        <Button priority="tertiary no outline" className={cx('fr-link--sm')}>
          {canEditPrescriptions(programmingPlan) &&
          (prescription.multiAnalysisCount ?? 0) === 0
            ? `Ajouter une analyse multi résidus`
            : `${t('analysis', {
                count: prescription.multiAnalysisCount || 0,
              })} multi résidus`}
        </Button>,
      ]}
    />
  );
};

export default PrescriptionAnalysis;
