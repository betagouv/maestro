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
import RegionalPrescriptionDepartmentalDistribution from '../RegionalPrescriptionDepartmentalDistribution/RegionalPrescriptionDepartmentalDistribution';

const regionalPrescriptionModal = createModal({
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

  useIsModalOpen(regionalPrescriptionModal, {
    onConceal: () => {
      dispatch(
        prescriptionsSlice.actions.setRegionalPrescriptionModalData(undefined)
      );
      setIsUpdateSuccess(false);
    }
  });

  const { regionalPrescriptionModalData } = useAppSelector(
    (state) => state.prescriptions
  );

  const [laboratoryId, setLaboratoryId] = useState(
    regionalPrescriptionModalData?.regionalPrescription.laboratoryId
  );
  const [departmentalPrescriptions, setDepartmentalPrescriptions] = useState(
    regionalPrescriptionModalData?.mode === 'distribution'
      ? regionalPrescriptionModalData.departmentalPrescriptions
      : undefined
  );
  const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery();
  const [updateRegionalPrescription] =
    apiClient.useUpdateRegionalPrescriptionMutation();

  const submitLaboratory = async () => {
    if (
      regionalPrescriptionModalData &&
      laboratoryId &&
      laboratoryId !==
        regionalPrescriptionModalData.regionalPrescription.laboratoryId
    ) {
      await onChangePrescriptionLaboratory(
        regionalPrescriptionModalData.prescription,
        laboratoryId
      );
    }
    regionalPrescriptionModal.close();
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
    if (regionalPrescriptionModalData?.mode === 'distribution') {
      await Promise.all(
        (departmentalPrescriptions ?? []).map((departmentalPrescription) =>
          updateRegionalPrescription({
            prescriptionId: regionalPrescriptionModalData.prescription.id,
            region: regionalPrescriptionModalData.regionalPrescription.region,
            department: departmentalPrescription.department as Department,
            prescriptionUpdate: {
              programmingPlanId:
                regionalPrescriptionModalData.programmingPlan.id,
              sampleCount: departmentalPrescription.sampleCount
            }
          })
        )
      );
      setIsUpdateSuccess(true);
    }
  };

  useEffect(() => {
    if (regionalPrescriptionModalData) {
      regionalPrescriptionModal.open();
      setLaboratoryId(
        regionalPrescriptionModalData?.regionalPrescription.laboratoryId
      );
      setDepartmentalPrescriptions(
        regionalPrescriptionModalData.mode === 'distribution'
          ? regionalPrescriptionModalData.departmentalPrescriptions
          : undefined
      );
    }
  }, [regionalPrescriptionModalData]);

  const title = useMemo(() => {
    if (isUpdateSuccess) {
      return 'Répartition enregistrée';
    }
    if (regionalPrescriptionModalData?.mode === 'distribution') {
      return `Répartition par département pour la matrice ${MatrixKindLabels[regionalPrescriptionModalData.prescription.matrixKind]}`;
    }
    if (regionalPrescriptionModalData?.mode === 'laboratory') {
      return `Configuration de la matrice ${MatrixKindLabels[regionalPrescriptionModalData.prescription.matrixKind]}`;
    }
  }, [isUpdateSuccess, regionalPrescriptionModalData]);

  return (
    <regionalPrescriptionModal.Component
      title={title}
      topAnchor
      size={
        regionalPrescriptionModalData?.mode === 'distribution'
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
                  regionalPrescriptionModalData?.mode === 'laboratory'
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
            {regionalPrescriptionModalData?.mode === 'laboratory' && (
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
            {regionalPrescriptionModalData?.mode === 'distribution' && (
              <RegionalPrescriptionDepartmentalDistribution
                {...regionalPrescriptionModalData}
                departmentalPrescriptions={departmentalPrescriptions ?? []}
                onChangeDepartmentalCount={changeDepartmentalCount}
              />
            )}
          </>
        )}
      </div>
    </regionalPrescriptionModal.Component>
  );
};

export default RegionalPrescriptionModal;
