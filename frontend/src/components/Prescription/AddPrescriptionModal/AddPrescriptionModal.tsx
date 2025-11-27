import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Autocomplete } from '@mui/material';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import { PrescriptionToCreate } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import React, { useContext, useMemo, useState } from 'react';
import { useForm } from '../../../hooks/useForm';
import { usePrescriptionFilters } from '../../../hooks/usePrescriptionFilters';
import { useAppSelector } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import { PrescriptionFilters } from '../../../store/reducers/prescriptionsSlice';
import ProgrammingPrescriptionFilters from '../../../views/ProgrammingView/ProgrammingPrescriptionFilters/ProgrammingPrescriptionFilters';
interface AddMatrixProps {
  programmingPlan: ProgrammingPlan;
  excludedMatrixKindList: MatrixKind[];
  excludedMatrixList: Matrix[];
}

const addPrescriptionModal = createModal({
  id: 'matrix-select-modal',
  isOpenedByDefault: false
});

const AddPrescriptionModal = ({
  programmingPlan,
  excludedMatrixKindList,
  excludedMatrixList
}: AddMatrixProps) => {
  const apiClient = useContext(ApiClientContext);

  const {
    programmingPlanOptions,
    programmingPlanKindOptions,
    contextOptions,
    reduceFilters
  } = usePrescriptionFilters([programmingPlan]);

  const isOpen = useIsModalOpen(addPrescriptionModal);

  const { prescriptionFilters: statePrescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const [prescriptionFilters, setPrescriptionFilters] =
    useState<PrescriptionFilters>(statePrescriptionFilters);
  const [matrixKindValue, setMatrixKindValue] = useState<{
    label: string;
    value: MatrixKind;
  } | null>(null);
  const [withMatrix, setWithMatrix] = useState(false);
  const [matrixValue, setMatrixValue] = useState<{
    label: string;
    value: Matrix;
  } | null>(null);
  const [addPrescription] = apiClient.useAddPrescriptionMutation();

  useIsModalOpen(addPrescriptionModal, {
    onConceal: () => {
      setPrescriptionFilters({
        year: prescriptionFilters.year
      });
      setMatrixKindValue(null);
      setWithMatrix(false);
      setMatrixValue(null);
    }
  });

  const formInput = useMemo(
    () => ({
      programmingPlanId: prescriptionFilters.programmingPlanId,
      programmingPlanKind: prescriptionFilters.kinds?.[0],
      context: prescriptionFilters.context,
      matrixKind: matrixKindValue?.value,
      matrix: withMatrix ? matrixValue?.value : undefined,
      stages: []
    }),
    [prescriptionFilters, matrixKindValue, matrixValue, withMatrix]
  );

  const form = useForm(PrescriptionToCreate, formInput);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await addPrescription(formInput as unknown as PrescriptionToCreate);
      addPrescriptionModal.close();
    });
  };

  return (
    <>
      <Button
        title="Ajouter"
        priority="secondary"
        onClick={(e) => {
          e.preventDefault();
          setPrescriptionFilters(statePrescriptionFilters);
          addPrescriptionModal.open();
        }}
        className={cx('fr-mr-3w')}
        data-testid="add-matrix-button"
      >
        Ajouter une programmation
      </Button>
      <addPrescriptionModal.Component
        title="Nouvelle programmation"
        size="large"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: (e) => e.preventDefault()
          },
          {
            children: 'Ajouter',
            onClick: submit,
            doClosesModal: false
          }
        ]}
      >
        {isOpen && (
          <>
            <ProgrammingPrescriptionFilters
              options={{
                plans: programmingPlanOptions(prescriptionFilters),
                kinds: programmingPlanKindOptions(prescriptionFilters),
                contexts: contextOptions(prescriptionFilters)
              }}
              programmingPlans={[programmingPlan]}
              filters={prescriptionFilters}
              onChange={(filters) =>
                setPrescriptionFilters(
                  reduceFilters(prescriptionFilters, filters)
                )
              }
              renderMode="modal"
              multiSelect={false}
            />
            <div
              className={cx('fr-mt-3v', 'fr-grid-row', 'fr-grid-row--gutters')}
            >
              <div className={cx('fr-col-12', 'fr-col-md-6')}>
                <label className={cx('fr-label', 'fr-mb-1w')}>
                  Catégorie de matrice
                </label>

                <Autocomplete
                  fullWidth
                  value={matrixKindValue}
                  onChange={(_, value) => {
                    if (value) {
                      setMatrixKindValue(value);
                    }
                  }}
                  renderInput={(params) => (
                    <div ref={params.InputProps.ref}>
                      <input
                        {...params.inputProps}
                        className="fr-input"
                        type="text"
                        placeholder={'Rechercher par libellé'}
                      />
                    </div>
                  )}
                  getOptionKey={(option) => option.value}
                  options={MatrixKindList.map((matrixKind) => ({
                    label: `${MatrixKindLabels[matrixKind]}`,
                    value: matrixKind
                  }))
                    .flat()
                    .filter(
                      (option) => !excludedMatrixKindList.includes(option.value)
                    )
                    .sort((a, b) => a.label.localeCompare(b.label))}
                  loadingText={`Recherche en cours...`}
                  noOptionsText="Aucun résultat"
                />
              </div>
              <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-mt-5w')}>
                <Checkbox
                  options={[
                    {
                      label: 'Définir une matrice',
                      nativeInputProps: {
                        checked: withMatrix,
                        onChange: (e) => {
                          setWithMatrix(e.target.checked);
                          if (e.target.checked) {
                            setMatrixValue(null);
                          }
                        },
                        disabled: !matrixKindValue
                      }
                    }
                  ]}
                />
              </div>
              {withMatrix && matrixKindValue && (
                <div className={cx('fr-col-12', 'fr-col-md-6')}>
                  <Autocomplete
                    fullWidth
                    value={matrixValue}
                    onChange={(_, value) => {
                      if (value) {
                        setMatrixValue(value);
                      }
                    }}
                    renderInput={(params) => (
                      <div ref={params.InputProps.ref}>
                        <input
                          {...params.inputProps}
                          className="fr-input"
                          type="text"
                          placeholder={'Rechercher par libellé'}
                        />
                      </div>
                    )}
                    getOptionKey={(option) => option.value}
                    options={MatrixListByKind[matrixKindValue?.value]
                      .map((matrix) => ({
                        label: `${MatrixLabels[matrix]}`,
                        value: matrix
                      }))
                      .flat()
                      .filter(
                        (option) => !excludedMatrixList.includes(option.value)
                      )
                      .sort((a, b) => a.label.localeCompare(b.label))}
                    loadingText={`Recherche en cours...`}
                    noOptionsText="Aucun résultat"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </addPrescriptionModal.Component>
    </>
  );
};

export default AddPrescriptionModal;
