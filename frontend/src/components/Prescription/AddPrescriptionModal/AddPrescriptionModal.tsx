import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Autocomplete } from '@mui/material';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { PrescriptionToCreate } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo, useState } from 'react';
import { useForm } from '../../../hooks/useForm';
import { usePrescriptionFilters } from '../../../hooks/usePrescriptionFilters';
import { useAppSelector } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import { PrescriptionFilters } from '../../../store/reducers/prescriptionsSlice';
import ProgrammingPrescriptionFilters from '../../../views/ProgrammingView/ProgrammingPrescriptionFilters/ProgrammingPrescriptionFilters';
interface AddMatrixProps {
  programmingPlan: ProgrammingPlan;
  excludedMatrixKindList: MatrixKind[];
}

const addPrescriptionModal = createModal({
  id: 'matrix-select-modal',
  isOpenedByDefault: false
});

const AddPrescriptionModal = ({
  programmingPlan,
  excludedMatrixKindList
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
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: MatrixKind;
  } | null>(null);
  const [addPrescription] = apiClient.useAddPrescriptionMutation();

  useIsModalOpen(addPrescriptionModal, {
    onConceal: () => {
      setPrescriptionFilters({
        year: prescriptionFilters.year
      });
    }
  });

  const formInput = useMemo(
    () => ({
      programmingPlanId: prescriptionFilters.programmingPlanId,
      programmingPlanKind: prescriptionFilters.kinds?.[0],
      context: prescriptionFilters.context,
      matrixKind: selectedOption?.value,
      stages: []
    }),
    [prescriptionFilters, selectedOption]
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
        Ajouter une matrice
      </Button>
      <addPrescriptionModal.Component
        title="Ajouter une matrice"
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
            <div className={cx('fr-mt-3w')}>
              <label className={cx('fr-label', 'fr-mb-1w')}>
                Libellé de la matrice
              </label>

              <Autocomplete
                fullWidth
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={selectedOption}
                isOptionEqualToValue={(option, value) => {
                  return option.value === value.value;
                }}
                onChange={(_, value) => {
                  if (value) {
                    setSelectedOption(
                      value as { label: string; value: MatrixKind }
                    );
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
                getOptionLabel={(option) => option.label}
                noOptionsText="Aucun résultat"
              />
            </div>
          </>
        )}
      </addPrescriptionModal.Component>
    </>
  );
};

export default AddPrescriptionModal;
