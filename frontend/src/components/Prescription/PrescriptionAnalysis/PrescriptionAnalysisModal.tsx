import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { useMemo } from 'react';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useGetPrescriptionSubstanceAnalysisQuery } from 'src/services/prescription.service';
interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  onSubmit: (matrix: Matrix) => void;
  modalButtons: React.ReactNode[];
}

const PrescriptionAnalysisModal = ({
  programmingPlan,
  prescription,
  onSubmit,
  modalButtons,
}: Props) => {
  const { canEditPrescriptions } = useAuthentication();

  const prescriptionAnalysisModal = useMemo(
    () =>
      createModal({
        id: `prescription-analysis-modal-${programmingPlan.id}-${prescription.id}`,
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
    <>
      {modalButtons.map((modalButton, index) => (
        <div key={index} onClick={() => prescriptionAnalysisModal.open()}>
          {modalButton}
        </div>
      ))}
      <prescriptionAnalysisModal.Component
        title="Analyses mono-résidus et multi-résidus"
        concealingBackdrop={false}
        topAnchor
      >
        <div>
          {canEditPrescriptions(programmingPlan) ? (
            <div className="d-flex-align-center"></div>
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
            <div className="d-flex-align-center"></div>
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
    </>
  );
};

export default PrescriptionAnalysisModal;
