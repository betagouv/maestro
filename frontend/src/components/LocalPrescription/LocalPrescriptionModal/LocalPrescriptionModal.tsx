import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import LocalPrescriptionDepartmentalDistribution from '../LocalPrescriptionDepartmentalDistribution/LocalPrescriptionDepartmentalDistribution';
import LocalPrescriptionSlaughterhouseDistribution from '../LocalPrescriptionSlaughterhouseDistribution/LocalPrescriptionSlaughterhouseDistribution';

const localPrescriptionModal = createModal({
  id: `regional-prescription-modal`,
  isOpenedByDefault: false
});

interface Props {
  onChangePrescriptionLaboratory: (
    prescription: Prescription,
    laboratoryId: string
  ) => Promise<void>;
}

const RegionalPrescriptionModal = ({
  onChangePrescriptionLaboratory
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const modalContentRef = useRef<
    (HTMLDivElement & { submit: () => Promise<boolean> }) | null
  >(null);

  useIsModalOpen(localPrescriptionModal, {
    onConceal: () => {
      dispatch(
        prescriptionsSlice.actions.setLocalPrescriptionModalData(undefined)
      );
      setIsUpdateSuccess(false);
    }
  });

  const { localPrescriptionModalData } = useAppSelector(
    (state) => state.prescriptions
  );

  const [laboratoryId, setLaboratoryId] = useState(
    localPrescriptionModalData?.mode === 'laboratory'
      ? localPrescriptionModalData.localPrescription.substancesLaboratories?.[0]
          ?.laboratoryId
      : undefined
  );
  const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery();
  const [updateLocalPrescription] =
    apiClient.useUpdateLocalPrescriptionMutation();

  const submitLaboratory = async () => {
    if (
      localPrescriptionModalData?.mode === 'laboratory' &&
      laboratoryId &&
      laboratoryId !==
        localPrescriptionModalData.localPrescription.substancesLaboratories?.[0]
          ?.laboratoryId
    ) {
      await onChangePrescriptionLaboratory(
        localPrescriptionModalData.prescription,
        laboratoryId
      );
    }
    localPrescriptionModal.close();
  };

  const submitSubLocalDistribution = async (
    subLocalPrescriptions: LocalPrescription[]
  ) => {
    if (localPrescriptionModalData?.mode === 'distributionToDepartments') {
      await Promise.all(
        (subLocalPrescriptions ?? []).map((departmentalPrescription) =>
          updateLocalPrescription({
            prescriptionId: localPrescriptionModalData.prescription.id,
            region: localPrescriptionModalData.localPrescription.region,
            department: departmentalPrescription.department as Department,
            prescriptionUpdate: {
              key: 'sampleCount',
              sampleCount: departmentalPrescription.sampleCount,
              programmingPlanId: localPrescriptionModalData.programmingPlan.id
            }
          })
        )
      );
      setIsUpdateSuccess(true);
    }
    if (localPrescriptionModalData?.mode === 'distributionToSlaughterhouses') {
      await updateLocalPrescription({
        prescriptionId: localPrescriptionModalData.prescription.id,
        region: localPrescriptionModalData.localPrescription.region,
        department: localPrescriptionModalData.localPrescription
          .department as Department,
        prescriptionUpdate: {
          key: 'slaughterhouseSampleCounts',
          slaughterhouseSampleCounts: subLocalPrescriptions,
          programmingPlanId: localPrescriptionModalData.programmingPlan.id
        }
      });
      setIsUpdateSuccess(true);
    }
  };

  useEffect(() => {
    if (localPrescriptionModalData) {
      localPrescriptionModal.open();
      setLaboratoryId(
        localPrescriptionModalData.mode === 'laboratory'
          ? localPrescriptionModalData?.localPrescription
              .substancesLaboratories?.[0]?.laboratoryId
          : undefined
      );
    }
  }, [localPrescriptionModalData]);

  const title = useMemo(() => {
    if (localPrescriptionModalData) {
      if (isUpdateSuccess) {
        return 'Répartition enregistrée';
      }
      if (localPrescriptionModalData?.mode === 'distributionToDepartments') {
        return `Répartition par département pour la matrice ${MatrixKindLabels[localPrescriptionModalData.prescription.matrixKind]}`;
      } else {
        return `Configuration de la matrice ${MatrixKindLabels[localPrescriptionModalData.prescription.matrixKind]}`;
      }
    }
  }, [isUpdateSuccess, localPrescriptionModalData]);

  const successMessage = useMemo(() => {
    if (localPrescriptionModalData?.mode === 'distributionToDepartments') {
      return 'La répartition la programmation a bien été enregistrée pour ces départements.';
    }
    if (localPrescriptionModalData?.mode === 'distributionToSlaughterhouses') {
      return 'La répartition la programmation a bien été enregistrée pour ces abattoirs.';
    }
    return 'Le laboratoire a bien été enregistré.';
  }, [localPrescriptionModalData]);

  return (
    <localPrescriptionModal.Component
      title={title}
      topAnchor
      size={
        localPrescriptionModalData?.mode === 'distributionToDepartments' ||
        localPrescriptionModalData?.mode === 'distributionToSlaughterhouses'
          ? 'large'
          : 'medium'
      }
      buttons={
        isUpdateSuccess
          ? [
              {
                children: 'Fermer',
                priority: 'secondary'
              }
            ]
          : [
              {
                children: 'Annuler',
                priority: 'secondary',
                onClick: (e) => e.preventDefault()
              },
              {
                children: 'Enregistrer',
                onClick: () =>
                  localPrescriptionModalData?.mode === 'laboratory'
                    ? submitLaboratory()
                    : modalContentRef.current?.submit(),
                doClosesModal: false
              }
            ]
      }
    >
      <div className="prescription-edit-modal-content">
        {isUpdateSuccess ? (
          successMessage
        ) : (
          <>
            {localPrescriptionModalData?.mode === 'laboratory' && (
              <Select
                label={undefined}
                nativeSelectProps={{
                  value: laboratoryId ?? '',
                  autoFocus: true,
                  onChange: (e) => setLaboratoryId(e.target.value)
                }}
                hint="Définissez un laboratoire destinataire des prélèvements"
                className={cx('fr-mb-0')}
              >
                <option value="" disabled>
                  Sélectionner un laboratoire
                </option>
                {sortBy(laboratories ?? [], 'name').map((laboratory) => (
                  <option key={laboratory.id} value={laboratory.id}>
                    {laboratory.name}
                  </option>
                ))}
              </Select>
            )}
            {localPrescriptionModalData?.mode ===
              'distributionToDepartments' && (
              <LocalPrescriptionDepartmentalDistribution
                ref={modalContentRef}
                programmingPlan={localPrescriptionModalData.programmingPlan}
                prescription={localPrescriptionModalData.prescription}
                regionalPrescription={
                  localPrescriptionModalData.localPrescription
                }
                departmentalPrescriptions={
                  localPrescriptionModalData.subLocalPrescriptions
                }
                onSubmit={submitSubLocalDistribution}
              />
            )}
            {localPrescriptionModalData?.mode ===
              'distributionToSlaughterhouses' && (
              <LocalPrescriptionSlaughterhouseDistribution
                ref={modalContentRef}
                departmentalPrescription={
                  localPrescriptionModalData.localPrescription
                }
                slaughterhousePrescriptions={
                  localPrescriptionModalData.subLocalPrescriptions
                }
                onSubmit={submitSubLocalDistribution}
              />
            )}
          </>
        )}
      </div>
    </localPrescriptionModal.Component>
  );
};

export default RegionalPrescriptionModal;
