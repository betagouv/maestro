import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';
import { PrescriptionSubstanceAnalysis } from 'shared/schema/Prescription/PrescriptionSubstanceAnalysis';
import PrescriptionAnalysisSelect from 'src/components/Prescription/PrescriptionAnalysis/PrescriptionAnalysisSelect';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { useGetPrescriptionSubstanceAnalysisQuery } from 'src/services/prescription.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import './PrescriptionAnalysis.scss';

const prescriptionAnalysisModal = createModal({
  id: `prescription-analysis-modal`,
  isOpenedByDefault: false,
});

interface Props {
  onUpdatePrescriptionSubstanceAnalysis: (
    prescriptionId: string,
    prescriptionSubstanceAnalysis: PrescriptionSubstanceAnalysis[]
  ) => Promise<void>;
}

const PrescriptionAnalysisModal = ({
  onUpdatePrescriptionSubstanceAnalysis,
}: Props) => {
  const dispatch = useAppDispatch();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  const { prescriptionAnalysisEditId } = useAppSelector(
    (state) => state.prescriptions
  );

  const { data: prescriptionSubstanceAnalysis } =
    useGetPrescriptionSubstanceAnalysisQuery(
      prescriptionAnalysisEditId ?? skipToken
    );

  useIsModalOpen(prescriptionAnalysisModal, {
    onConceal: () => {
      dispatch(
        prescriptionsSlice.actions.setPrescriptionAnalysisEditId(undefined)
      );
    },
  });

  useEffect(() => {
    if (prescriptionAnalysisEditId) {
      prescriptionAnalysisModal.open();
    }
  }, [prescriptionAnalysisEditId]);

  return (
    <div className="prescription-analysis-modal">
      <prescriptionAnalysisModal.Component
        title="Analyses mono-résidus et multi-résidus"
        concealingBackdrop={false}
        topAnchor
      >
        {programmingPlan &&
          prescriptionAnalysisEditId &&
          prescriptionSubstanceAnalysis && (
            <>
              <PrescriptionAnalysisSelect
                programmingPlan={programmingPlan}
                prescriptionId={prescriptionAnalysisEditId}
                prescriptionSubstanceAnalysis={prescriptionSubstanceAnalysis}
                analysisKind="Mono"
                onUpdatePrescriptionSubstanceAnalysis={
                  onUpdatePrescriptionSubstanceAnalysis
                }
              />
              <hr className={cx('fr-mt-3w', 'fr-mb-2w')} />
              <PrescriptionAnalysisSelect
                programmingPlan={programmingPlan}
                prescriptionId={prescriptionAnalysisEditId}
                prescriptionSubstanceAnalysis={prescriptionSubstanceAnalysis}
                analysisKind="Multi"
                onUpdatePrescriptionSubstanceAnalysis={
                  onUpdatePrescriptionSubstanceAnalysis
                }
              />
            </>
          )}
      </prescriptionAnalysisModal.Component>
    </div>
  );
};

export default PrescriptionAnalysisModal;
