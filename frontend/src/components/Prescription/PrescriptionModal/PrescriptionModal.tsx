import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import {
  getPrescriptionTitle,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import type { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import PrescriptionBreadcrumb from '../PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import PrescriptionEditSubstances from '../PrescriptionEditSubstances/PrescriptionEditSubstances';
import PrescriptionNotes from '../PrescriptionNotes/PrescriptionNotes';
import PrescriptionSubstances from '../PrescriptionSubstances/PrescriptionSubstances';
import './PrescriptionModal.scss';

const prescriptionModal = createModal({
  id: `prescription-modal`,
  isOpenedByDefault: false
});

interface Props {
  onUpdatePrescriptionSubstances: (
    prescription: Prescription,
    prescriptionSubstances: PrescriptionSubstance[]
  ) => Promise<void>;
}

const PrescriptionModal = ({ onUpdatePrescriptionSubstances }: Props) => {
  const dispatch = useAppDispatch();

  const { prescriptionModalData } = useAppSelector(
    (state) => state.prescriptions
  );

  const title = useMemo(() => {
    if (prescriptionModalData?.mode === 'analysis') {
      return 'Analyses mono-résidu et multi-résidus';
    }
    if (prescriptionModalData?.mode === 'details') {
      return `Info prélèvement sur la matrice ${getPrescriptionTitle(prescriptionModalData.prescription)}`;
    }
  }, [prescriptionModalData]);

  useEffect(() => {
    if (prescriptionModalData) {
      prescriptionModal.open();
    }
  }, [prescriptionModalData]);

  //Hack car la méthode "onConceal" de useIsModalOpen pose problème (ell est appelée lorsqu'on clique sur les tabs)
  const dialogParentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!dialogParentRef.current) {
      return;
    }

    const dialog = dialogParentRef.current.querySelector(
      'dialog'
    ) as HTMLDialogElement | null;
    if (!dialog) {
      return;
    }

    const mo = new MutationObserver(() => {
      if (!dialog.open) {
        dispatch(
          prescriptionsSlice.actions.setPrescriptionModalData(undefined)
        );
      }
    });
    mo.observe(dialog, { attributes: true, attributeFilter: ['open'] });

    return () => {
      mo.disconnect();
    };
  }, [dialogParentRef]);

  return (
    <div className="prescription-substances-modal" ref={dialogParentRef}>
      <prescriptionModal.Component
        title={
          <>
            {prescriptionModalData && (
              <PrescriptionBreadcrumb {...prescriptionModalData} />
            )}
            {title}
          </>
        }
        topAnchor
      >
        <div className="prescription-edit-modal-content">
          {prescriptionModalData?.mode === 'analysis' && (
            <PrescriptionEditSubstances
              programmingPlan={prescriptionModalData.programmingPlan}
              prescription={prescriptionModalData.prescription}
              onUpdatePrescriptionSubstances={(prescriptionSubstances) =>
                onUpdatePrescriptionSubstances(
                  prescriptionModalData.prescription,
                  prescriptionSubstances
                )
              }
            />
          )}
          {prescriptionModalData?.mode === 'details' && (
            <Tabs
              tabs={[
                {
                  label: 'Analyses',
                  content: (
                    <PrescriptionSubstances
                      {...prescriptionModalData}
                      renderMode="inline"
                    />
                  )
                },
                {
                  iconId:
                    (prescriptionModalData.prescription.notes ?? '').length > 0
                      ? 'fr-icon-quote-line'
                      : undefined,
                  label: 'Note',
                  content: (
                    <PrescriptionNotes
                      programmingPlan={prescriptionModalData.programmingPlan}
                      value={prescriptionModalData.prescription.notes ?? ''}
                    />
                  )
                }
              ]}
              classes={{
                panel: 'fr-p-3w'
              }}
            />
          )}
        </div>
      </prescriptionModal.Component>
    </div>
  );
};

export default PrescriptionModal;
