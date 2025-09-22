import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';
import PrescriptionBreadcrumb from '../PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import PrescriptionNotes from '../PrescriptionNotes/PrescriptionNotes';
import PrescriptionStages from '../PrescriptionStages/PrescriptionStages';
import './PrescriptionEditModal.scss';
import PrescriptionEditSubstances from './PrescriptionEditSubstances';
import PrescriptionEditSubstancesButtons from './PrescriptionEditSubstancesButtons';

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
  const modalRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const { prescriptionEditData } = useAppSelector(
    (state) => state.prescriptions
  );

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        console.log('close modal');
        // dispatch(prescriptionsSlice.actions.setPrescriptionEditData(undefined));
        prescriptionEditModal.close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef]); // eslint-disable-line react-hooks/exhaustive-deps

  useIsModalOpen(prescriptionEditModal, {
    onConceal: () => {
      console.log('close modal conceal');
      dispatch(prescriptionsSlice.actions.setPrescriptionEditData(undefined));
    }
  });

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

  return (
    <div className="prescription-substances-modal">
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
        <div ref={modalRef}>
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
            <div
              onClick={(e) => {
                console.log('div close modal');
                e.preventDefault();
              }}
            >
              <Tabs
                tabs={[
                  {
                    label: 'Analyses',
                    content: (
                      <PrescriptionEditSubstancesButtons
                        {...prescriptionEditData}
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
            </div>
          )}
        </div>
      </prescriptionEditModal.Component>
    </div>
  );
};

export default PrescriptionEditModal;
