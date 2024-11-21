import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { t } from 'i18next';
import { useMemo } from 'react';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
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
        isOpenedByDefault: true,
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
        <div>
          {canEditPrescriptions(programmingPlan) ? (
            <div className="d-flex-align-center">
              <div>TODO champs de recherche et bouton d'ajout</div>
            </div>
          ) : (
            <label className={cx('fr-label')}>Mono résidu</label>
          )}

          {prescriptionSubstanceAnalysis
            ?.filter(
              (prescriptionSubstance) =>
                prescriptionSubstance.analysisKind === 'Mono'
            )
            .map((prescriptionSubstance) => (
              <Tag
                key={`${prescriptionSubstance.prescriptionId}-${prescriptionSubstance.substance.code}`}
                dismissible={canEditPrescriptions(programmingPlan)}
                small
                nativeButtonProps={
                  canEditPrescriptions(programmingPlan)
                    ? {
                        onClick: () => {},
                      }
                    : undefined
                }
                className={cx('fr-m-1v')}
              >
                {prescriptionSubstance.substance.label}
              </Tag>
            ))}
        </div>
        <hr className={cx('fr-my-1w')} />
        <div>
          {canEditPrescriptions(programmingPlan) ? (
            <div className="d-flex-align-center">
              <div>TODO champs de recherche et bouton d'ajout</div>
            </div>
          ) : (
            <label className={cx('fr-label')}>Multi résidus</label>
          )}
          {prescriptionSubstanceAnalysis
            ?.filter(
              (prescriptionSubstance) =>
                prescriptionSubstance.analysisKind === 'Multi'
            )
            .map((prescriptionSubstance) => (
              <Tag
                key={`${prescriptionSubstance.prescriptionId}-${prescriptionSubstance.substance.code}`}
                dismissible={canEditPrescriptions(programmingPlan)}
                small
                nativeButtonProps={
                  canEditPrescriptions(programmingPlan)
                    ? {
                        onClick: () => {},
                      }
                    : undefined
                }
                className={cx('fr-m-1v')}
              >
                {prescriptionSubstance.substance.label}
              </Tag>
            ))}
        </div>
      </prescriptionAnalysisModal.Component>
    </div>
  );
};

export default PrescriptionAnalysisModal;
