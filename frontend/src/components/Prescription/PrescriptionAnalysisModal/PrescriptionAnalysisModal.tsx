import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { t } from 'i18next';
import { useMemo } from 'react';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionAnalysisByKind from 'src/components/Prescription/PrescriptionAnalysisModal/PrescriptionAnalysisByKind';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useGetPrescriptionSubstanceAnalysisQuery } from 'src/services/prescription.service';
import './PrescriptionAnalysisModal.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionAnalysisModal = ({
  programmingPlan,
  prescription,
}: Props) => {
  const { canEditPrescriptions } = useAuthentication();

  const prescriptionAnalysisModal = useMemo(
    () =>
      createModal({
        id: `prescription-analysis-modal-${prescription.id}`,
        isOpenedByDefault: false,
      }),
    [prescription]
  );

  const isOpen = useIsModalOpen(prescriptionAnalysisModal);

  const { data: prescriptionSubstanceAnalysis } =
    useGetPrescriptionSubstanceAnalysisQuery(prescription.id, {
      skip: !isOpen,
    });

  return (
    <div className="prescription-analysis-modal">
      <div>
        <Button
          onClick={() => prescriptionAnalysisModal.open()}
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
          onClick={() => prescriptionAnalysisModal.open()}
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
      <prescriptionAnalysisModal.Component
        title="Analyses mono-résidus et multi-résidus"
        concealingBackdrop={false}
        topAnchor
      >
        {prescriptionSubstanceAnalysis && (
          <>
            <PrescriptionAnalysisByKind
              programmingPlan={programmingPlan}
              prescriptionId={prescription.id}
              prescriptionSubstanceAnalysis={prescriptionSubstanceAnalysis.filter(
                (prescriptionSubstance) =>
                  prescriptionSubstance.analysisKind === 'Mono'
              )}
              analysisKind="Mono"
            />
            <hr className={cx('fr-mt-3w', 'fr-mb-2w')} />
            <PrescriptionAnalysisByKind
              programmingPlan={programmingPlan}
              prescriptionId={prescription.id}
              prescriptionSubstanceAnalysis={prescriptionSubstanceAnalysis.filter(
                (prescriptionSubstance) =>
                  prescriptionSubstance.analysisKind === 'Multi'
              )}
              analysisKind="Multi"
            />
          </>
        )}
      </prescriptionAnalysisModal.Component>
    </div>
  );
};

export default PrescriptionAnalysisModal;
