import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import LocalPrescriptionDepartmentalDistribution from '../LocalPrescriptionDepartmentalDistribution/LocalPrescriptionDepartmentalDistribution';

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
      ? localPrescriptionModalData.localPrescription.laboratoryId
      : undefined
  );
  const [departmentalPrescriptions, setDepartmentalPrescriptions] = useState(
    localPrescriptionModalData?.mode === 'distribution'
      ? localPrescriptionModalData.departmentalPrescriptions
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
      laboratoryId !== localPrescriptionModalData.localPrescription.laboratoryId
    ) {
      await onChangePrescriptionLaboratory(
        localPrescriptionModalData.prescription,
        laboratoryId
      );
    }
    localPrescriptionModal.close();
  };

  const changeDepartmentalCount = async (
    department: Department,
    sampleCount: number
  ) => {
    setDepartmentalPrescriptions((prev) =>
      prev?.map((dp) =>
        dp.department === department ? { ...dp, sampleCount } : dp
      )
    );
  };

  const submitDepartmentalDistribution = async () => {
    if (localPrescriptionModalData?.mode === 'distribution') {
      await Promise.all(
        (departmentalPrescriptions ?? []).map((departmentalPrescription) =>
          updateLocalPrescription({
            prescriptionId: localPrescriptionModalData.prescription.id,
            region: localPrescriptionModalData.regionalPrescription.region,
            department: departmentalPrescription.department as Department,
            prescriptionUpdate: {
              programmingPlanId: localPrescriptionModalData.programmingPlan.id,
              sampleCount: departmentalPrescription.sampleCount
            }
          })
        )
      );
      setIsUpdateSuccess(true);
    }
  };

  useEffect(() => {
    if (localPrescriptionModalData) {
      localPrescriptionModal.open();
      setLaboratoryId(
        localPrescriptionModalData.mode === 'laboratory'
          ? localPrescriptionModalData?.localPrescription.laboratoryId
          : undefined
      );
      setDepartmentalPrescriptions(
        localPrescriptionModalData.mode === 'distribution'
          ? localPrescriptionModalData.departmentalPrescriptions
          : undefined
      );
    }
  }, [localPrescriptionModalData]);

  const title = useMemo(() => {
    if (isUpdateSuccess) {
      return 'Répartition enregistrée';
    }
    if (localPrescriptionModalData?.mode === 'distribution') {
      return `Répartition par département pour la matrice ${MatrixKindLabels[localPrescriptionModalData.prescription.matrixKind]}`;
    }
    if (localPrescriptionModalData?.mode === 'laboratory') {
      return `Configuration de la matrice ${MatrixKindLabels[localPrescriptionModalData.prescription.matrixKind]}`;
    }
  }, [isUpdateSuccess, localPrescriptionModalData]);

  return (
    <localPrescriptionModal.Component
      title={title}
      topAnchor
      size={
        localPrescriptionModalData?.mode === 'distribution' ? 'large' : 'medium'
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
                    : submitDepartmentalDistribution(),
                doClosesModal: false
              }
            ]
      }
    >
      <div className="prescription-edit-modal-content">
        {isUpdateSuccess ? (
          <>
            La répartition la programmation a bien été enregistrée pour ces
            départements.
          </>
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
            {localPrescriptionModalData?.mode === 'distribution' && (
              <LocalPrescriptionDepartmentalDistribution
                {...localPrescriptionModalData}
                departmentalPrescriptions={departmentalPrescriptions ?? []}
                onChangeDepartmentalCount={changeDepartmentalCount}
              />
            )}
          </>
        )}
      </div>
    </localPrescriptionModal.Component>
  );
};

export default RegionalPrescriptionModal;
