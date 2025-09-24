import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import { sortBy } from 'lodash-es';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';

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
    }
  });

  const { regionalPrescriptionModalData } = useAppSelector(
    (state) => state.prescriptions
  );

  const [laboratoryId, setLaboratoryId] = useState(
    regionalPrescriptionModalData?.regionalPrescription.laboratoryId
  );

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery();

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

  useEffect(() => {
    if (regionalPrescriptionModalData) {
      regionalPrescriptionModal.open();
      setLaboratoryId(
        regionalPrescriptionModalData?.regionalPrescription.laboratoryId
      );
    }
  }, [regionalPrescriptionModalData]);

  return (
    <regionalPrescriptionModal.Component
      iconId="fr-icon-team-line"
      title="Configuration de la matrice"
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          onClick: (e) => e.preventDefault()
        },
        {
          children: 'Enregistrer',
          onClick: submitLaboratory,
          doClosesModal: false
        }
      ]}
    >
      <div className="prescription-edit-modal-content">
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
        {regionalPrescriptionModalData?.mode === 'distribution' && <></>}
      </div>
    </regionalPrescriptionModal.Component>
  );
};

export default RegionalPrescriptionModal;
