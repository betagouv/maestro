import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { skipToken } from '@reduxjs/toolkit/query';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { useEffect } from 'react';
import PrescriptionSubstancesSelect from 'src/components/Prescription/PrescriptionSubstancesModal/PrescriptionSubstancesSelect';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { useGetPrescriptionSubstancesQuery } from 'src/services/prescription.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import './PrescriptionSubstances.scss';

const prescriptionSubstancesModal = createModal({
  id: `prescription-substances-modal`,
  isOpenedByDefault: false
});

interface Props {
  onUpdatePrescriptionSubstances: (
    prescriptionId: string,
    prescriptionSubstances: PrescriptionSubstance[]
  ) => Promise<void>;
}

const PrescriptionSubstancesModal = ({
  onUpdatePrescriptionSubstances
}: Props) => {
  const dispatch = useAppDispatch();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  const { prescriptionAnalysisEditId } = useAppSelector(
    (state) => state.prescriptions
  );

  const { data: prescriptionSubstances } = useGetPrescriptionSubstancesQuery(
    prescriptionAnalysisEditId ?? skipToken
  );

  useIsModalOpen(prescriptionSubstancesModal, {
    onConceal: () => {
      dispatch(
        prescriptionsSlice.actions.setPrescriptionAnalysisEditId(undefined)
      );
    }
  });

  useEffect(() => {
    if (prescriptionAnalysisEditId) {
      prescriptionSubstancesModal.open();
    }
  }, [prescriptionAnalysisEditId]);

  return (
    <div className="prescription-substances-modal">
      <prescriptionSubstancesModal.Component
        title="Analyses mono-résidus et multi-résidus"
        concealingBackdrop={false}
        topAnchor
      >
        {programmingPlan &&
          prescriptionAnalysisEditId &&
          prescriptionSubstances && (
            <>
              <PrescriptionSubstancesSelect
                programmingPlan={programmingPlan}
                prescriptionId={prescriptionAnalysisEditId}
                prescriptionSubstances={prescriptionSubstances}
                analysisMethod="Mono"
                onUpdatePrescriptionSubstances={onUpdatePrescriptionSubstances}
              />
              <hr className={cx('fr-mt-3w', 'fr-mb-2w')} />
              <PrescriptionSubstancesSelect
                programmingPlan={programmingPlan}
                prescriptionId={prescriptionAnalysisEditId}
                prescriptionSubstances={prescriptionSubstances}
                analysisMethod="Multi"
                onUpdatePrescriptionSubstances={onUpdatePrescriptionSubstances}
              />
            </>
          )}
      </prescriptionSubstancesModal.Component>
    </div>
  );
};

export default PrescriptionSubstancesModal;
