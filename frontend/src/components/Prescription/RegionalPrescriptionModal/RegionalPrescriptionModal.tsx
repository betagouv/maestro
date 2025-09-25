import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import { t } from 'i18next';
import { sortBy } from 'lodash-es';
import {
  DepartmentLabels,
  DepartmentList
} from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Regions } from 'maestro-shared/referential/Region';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import RegionalPrescriptionCountCell from '../RegionalPrescriptionCountCell/RegionalPrescriptionCountCell';

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

  const title = useMemo(() => {
    if (regionalPrescriptionModalData?.mode === 'distribution') {
      return `Répartition par département pour la matrice ${MatrixKindLabels[regionalPrescriptionModalData.prescription.matrixKind]}`;
    }
    if (regionalPrescriptionModalData?.mode === 'laboratory') {
      return `Configuration de la matrice ${MatrixKindLabels[regionalPrescriptionModalData.prescription.matrixKind]}`;
    }
  }, [regionalPrescriptionModalData]);

  const departmentList = useMemo(
    () =>
      regionalPrescriptionModalData
        ? DepartmentList.filter((_) =>
            Regions[
              regionalPrescriptionModalData.regionalPrescription.region
            ].departments.includes(_)
          )
        : [],
    [regionalPrescriptionModalData]
  );

  return (
    <regionalPrescriptionModal.Component
      title={title}
      topAnchor
      size={
        regionalPrescriptionModalData?.mode === 'distribution'
          ? 'large'
          : 'medium'
      }
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
        {regionalPrescriptionModalData?.mode === 'distribution' && (
          <>
            <span className={cx('fr-text--bold')}>
              {t('sample', {
                count:
                  regionalPrescriptionModalData.regionalPrescription.sampleCount
              })}{' '}
            </span>
            <div>
              Départements
              <Table
                bordered={false}
                noCaption
                noScroll
                fixed
                headers={departmentList
                  .slice(0, departmentList.length / 2)
                  .map((department) => (
                    <span
                      key={`${Math.random()}_header_${department}`}
                      className="no-wrap"
                    >
                      {department} - {DepartmentLabels[department]}
                    </span>
                  ))}
                data={[
                  regionalPrescriptionModalData.departmentalPrescriptions
                    .slice(0, departmentList.length / 2)
                    .map((regionalPrescription) => (
                      <RegionalPrescriptionCountCell
                        key={`${regionalPrescription.prescriptionId}-${regionalPrescription.region}`}
                        programmingPlan={
                          regionalPrescriptionModalData.programmingPlan
                        }
                        matrixKind={
                          regionalPrescriptionModalData.prescription.matrixKind
                        }
                        regionalPrescription={regionalPrescription}
                        onChange={
                          async (value) => {}
                          // onChangeRegionalCount(
                          //   regionalPrescription.region,
                          //   value
                          // )
                        }
                      />
                    ))
                ]}
                className={cx('fr-mb-3w', 'fr-mt-1v')}
              />
            </div>
          </>
        )}
      </div>
    </regionalPrescriptionModal.Component>
  );
};

export default RegionalPrescriptionModal;
