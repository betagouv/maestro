import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { Department } from 'maestro-shared/referential/Department';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';
import LocalPrescriptionDepartmentalDistribution from '../LocalPrescriptionDepartmentalDistribution/LocalPrescriptionDepartmentalDistribution';
import LocalPrescriptionSlaughterhouseDistribution from '../LocalPrescriptionSlaughterhouseDistribution/LocalPrescriptionSlaughterhouseDistribution';
import LocalPrescriptionSubstanceKindsLaboratories from '../LocalPrescriptionSubstanceKindsLaboratories/LocalPrescriptionSubstanceKindsLaboratories';

const localPrescriptionModal = createModal({
  id: `regional-prescription-modal`,
  isOpenedByDefault: false
});

const LocalPrescriptionModal = () => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const modalContentRef = useRef<
    (HTMLDivElement & { submit: () => Promise<boolean> }) | null
  >(null);
  const { hasUserLocalPrescriptionPermission } = useAuthentication();

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

  const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);
  const [updateLocalPrescription] =
    apiClient.useUpdateLocalPrescriptionMutation();
  const [updateDepartmentalLocalPrescription] =
    apiClient.useUpdateDepartmentalLocalPrescriptionMutation();

  useEffect(() => {
    if (localPrescriptionModalData) {
      localPrescriptionModal.open();
    }
  }, [localPrescriptionModalData]);

  const readonly = useMemo(
    () =>
      localPrescriptionModalData?.mode === 'laboratory' &&
      !hasUserLocalPrescriptionPermission(
        localPrescriptionModalData.programmingPlan,
        localPrescriptionModalData.localPrescription
      )?.updateLaboratories,
    [localPrescriptionModalData, hasUserLocalPrescriptionPermission]
  );

  const submitSubstanceKindsLaboratories = async (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => {
    if (localPrescriptionModalData?.mode === 'laboratory') {
      const localPrescriptionUpdate = {
        prescriptionId: localPrescriptionModalData.prescription.id,
        region: localPrescriptionModalData.localPrescription.region,
        department: localPrescriptionModalData.localPrescription
          .department as Department,
        key: 'laboratories' as const,
        substanceKindsLaboratories,
        programmingPlanId: localPrescriptionModalData.programmingPlan.id
      };

      if (localPrescriptionModalData.localPrescription.department) {
        await updateDepartmentalLocalPrescription({
          ...localPrescriptionUpdate,
          department: localPrescriptionModalData.localPrescription.department
        });
      } else {
        await updateLocalPrescription(localPrescriptionUpdate);
      }
      setIsUpdateSuccess(true);
    }
  };

  const submitSubLocalDistribution = async (
    subLocalPrescriptions: LocalPrescription[]
  ) => {
    if (localPrescriptionModalData?.mode === 'distributionToDepartments') {
      await Promise.all(
        (subLocalPrescriptions ?? []).map((departmentalPrescription) =>
          updateDepartmentalLocalPrescription({
            prescriptionId: localPrescriptionModalData.prescription.id,
            region: localPrescriptionModalData.localPrescription.region,
            department: departmentalPrescription.department as Department,
            key: 'sampleCount',
            sampleCount: departmentalPrescription.sampleCount,
            programmingPlanId: localPrescriptionModalData.programmingPlan.id
          })
        )
      );
      setIsUpdateSuccess(true);
    }
    if (localPrescriptionModalData?.mode === 'distributionToSlaughterhouses') {
      await updateDepartmentalLocalPrescription({
        prescriptionId: localPrescriptionModalData.prescription.id,
        region: localPrescriptionModalData.localPrescription.region,
        department: localPrescriptionModalData.localPrescription
          .department as Department,
        key: 'slaughterhouseSampleCounts',
        slaughterhouseSampleCounts: subLocalPrescriptions,
        programmingPlanId: localPrescriptionModalData.programmingPlan.id
      });
      setIsUpdateSuccess(true);
    }
  };

  const title = useMemo(() => {
    if (localPrescriptionModalData) {
      if (isUpdateSuccess) {
        return 'Attribution enregistrée';
      }
      if (localPrescriptionModalData?.mode === 'distributionToDepartments') {
        return `Répartition par département pour la matrice ${getPrescriptionTitle(localPrescriptionModalData.prescription).toLowerCase()}`;
      } else {
        return `Configuration de la matrice ${getPrescriptionTitle(localPrescriptionModalData.prescription).toLowerCase()}`;
      }
    }
  }, [isUpdateSuccess, localPrescriptionModalData]);

  const successMessage = useMemo(() => {
    if (localPrescriptionModalData?.mode === 'distributionToDepartments') {
      return 'La répartition de la programmation a bien été enregistrée pour ces départements.';
    }
    if (localPrescriptionModalData?.mode === 'distributionToSlaughterhouses') {
      return 'La répartition de la programmation a bien été enregistrée pour ces abattoirs.';
    }
    return pluralize(
      (localPrescriptionModalData?.programmingPlan.substanceKinds ?? []).length,
      {
        ignores: ['bien', 'été'],
        replacements: [
          {
            old: 'a',
            new: 'ont'
          }
        ]
      }
    )('Le laboratoire a bien été enregistré');
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
        isUpdateSuccess || readonly
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
                onClick: () => modalContentRef.current?.submit(),
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
              <LocalPrescriptionSubstanceKindsLaboratories
                ref={modalContentRef}
                programmingPlanId={
                  localPrescriptionModalData.programmingPlan.id
                }
                substanceKindsLaboratories={
                  (
                    localPrescriptionModalData.localPrescription
                      .substanceKindsLaboratories ?? []
                  ).length > 0
                    ? (localPrescriptionModalData.localPrescription
                        .substanceKindsLaboratories as SubstanceKindLaboratory[])
                    : localPrescriptionModalData.programmingPlan.substanceKinds.map(
                        (substanceKind) => ({
                          substanceKind,
                          laboratoryId: undefined
                        })
                      )
                }
                onSubmit={submitSubstanceKindsLaboratories}
                readonly={readonly}
              />
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
                prescription={localPrescriptionModalData.prescription}
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

export default LocalPrescriptionModal;
