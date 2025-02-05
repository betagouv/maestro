import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Autocomplete } from '@mui/material';
import { isNil } from 'lodash-es';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import React, { useState } from 'react';
interface AddMatrixProps {
  excludedMatrixKindList: MatrixKind[];
  onSelect: (matrixKind: MatrixKind) => Promise<void>;
  buttonTitle?: string;
}

const matrixSelectModal = createModal({
  id: 'matrix-select-modal',
  isOpenedByDefault: false
});

const MatrixSelectModal = ({
  excludedMatrixKindList,
  onSelect,
  buttonTitle
}: AddMatrixProps) => {
  useIsModalOpen(matrixSelectModal, {
    onConceal: () => {
      setSelectedOption(null);
    }
  });

  const isOpen = useIsModalOpen(matrixSelectModal);
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: MatrixKind;
  } | null>(null);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (!isNil(selectedOption)) {
      await onSelect(selectedOption.value);
      matrixSelectModal.close();
    }
  };

  return (
    <>
      <Button
        title="Ajouter"
        priority="secondary"
        onClick={(e) => {
          e.preventDefault();
          matrixSelectModal.open();
        }}
        className={cx('fr-mr-3w')}
        data-testid="add-matrix-button"
      >
        {buttonTitle ?? 'Ajouter'}
      </Button>
      <matrixSelectModal.Component
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
        )}
      </matrixSelectModal.Component>
    </>
  );
};

export default MatrixSelectModal;
