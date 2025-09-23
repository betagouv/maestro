import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { pluralize } from 'src/utils/stringUtils';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import PrescriptionBreadcrumb from '../PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import PrescriptionEditSubstances from '../PrescriptionEditSubstances/PrescriptionEditSubstances';
import PrescriptionNotes from '../PrescriptionNotes/PrescriptionNotes';
import PrescriptionStages from '../PrescriptionStages/PrescriptionStages';
import PrescriptionSubstances from '../PrescriptionSubstances/PrescriptionSubstances';
import './PrescriptionEditModal.scss';

const prescriptionEditModal = createModal({
  id: `prescription-substances-modal`,
  isOpenedByDefault: false
});

interface Props {
  onUpdatePrescriptionSubstances: (
    prescription: Prescription,
    prescriptionSubstances: PrescriptionSubstance[]
  ) => Promise<void>;
}

const PrescriptionEditModal = ({ onUpdatePrescriptionSubstances }: Props) => {
  const dispatch = useAppDispatch();

  const { prescriptionEditData } = useAppSelector(
    (state) => state.prescriptions
  );

  const title = useMemo(() => {
    if (prescriptionEditData?.mode === 'analysis') {
      return 'Analyses mono-résidu et multi-résidus';
    }
    if (prescriptionEditData?.mode === 'details') {
      return `Plus de détails sur la matrice ${MatrixKindLabels[prescriptionEditData.prescription.matrixKind]}`;
    }
  }, [prescriptionEditData]);

  useEffect(() => {
    if (prescriptionEditData) {
      prescriptionEditModal.open();
    }
  }, [prescriptionEditData]);

  //Hack car la méthode "onConceal" de useIsModalOpen pose problème (ell est appelée lorsqu'on clique sur les tabs)
  const dialogParentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!dialogParentRef.current) {
      console.log('no dialogParentRef');
      return;
    }

    const dialog = dialogParentRef.current.querySelector(
      'dialog'
    ) as HTMLDialogElement | null;
    if (!dialog) {
      console.log('no dialog');
      return;
    }

    const mo = new MutationObserver(() => {
      if (!dialog.open) {
        dispatch(prescriptionsSlice.actions.setPrescriptionEditData(undefined));
      }
    });
    mo.observe(dialog, { attributes: true, attributeFilter: ['open'] });

    return () => {
      mo.disconnect();
    };
  }, [dialogParentRef]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="prescription-substances-modal" ref={dialogParentRef}>
      <prescriptionEditModal.Component
        title={
          <>
            {prescriptionEditData && (
              <PrescriptionBreadcrumb {...prescriptionEditData} />
            )}
            {title}
          </>
        }
        topAnchor
      >
        <div className="prescription-edit-modal-content">
          {prescriptionEditData?.mode === 'analysis' && (
            <PrescriptionEditSubstances
              programmingPlan={prescriptionEditData.programmingPlan!}
              prescription={prescriptionEditData.prescription}
              onUpdatePrescriptionSubstances={(prescriptionSubstances) =>
                onUpdatePrescriptionSubstances(
                  prescriptionEditData.prescription,
                  prescriptionSubstances
                )
              }
            />
          )}
          {prescriptionEditData?.mode === 'details' && (
            <Tabs
              tabs={[
                {
                  label: 'Analyses',
                  content: (
                    <PrescriptionSubstances
                      {...prescriptionEditData}
                      renderMode="inline"
                    />
                  )
                },
                {
                  iconId:
                    prescriptionEditData.prescription.stages.length > 0
                      ? 'fr-icon-check-line'
                      : undefined,
                  label: pluralize(
                    prescriptionEditData.prescription.stages.length
                  )('Stade'),
                  content: (
                    <PrescriptionStages
                      {...prescriptionEditData}
                      label={`${pluralize(prescriptionEditData.prescription.stages.length)('Stade')} de prélèvement`}
                    />
                  )
                },
                {
                  iconId:
                    (prescriptionEditData.prescription.notes ?? '').length > 0
                      ? 'fr-icon-quote-line'
                      : undefined,
                  label: 'Note',
                  content: (
                    <PrescriptionNotes
                      programmingPlan={prescriptionEditData.programmingPlan}
                      value={prescriptionEditData.prescription.notes ?? ''}
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
      </prescriptionEditModal.Component>
    </div>
  );
};

export default PrescriptionEditModal;
