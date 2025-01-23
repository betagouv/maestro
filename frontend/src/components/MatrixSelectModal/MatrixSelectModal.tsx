import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Autocomplete } from '@mui/material';
import React, { useState } from 'react';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/MatrixKind';
import { isNil } from 'lodash-es';
interface AddMatrixProps {
  excludedMatrixList: Matrix[];
  onSelect: (matrix: Matrix) => Promise<void>;
  buttonTitle?: string;
}

const matrixSelectModal = createModal({
  id: 'matrix-select-modal',
  isOpenedByDefault: false
});

const MatrixSelectModal = ({
  excludedMatrixList,
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
    value: Matrix;
  } | null>(null);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if( !isNil(selectedOption)) {
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
                setSelectedOption(value as { label: string; value: Matrix });
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
            options={MatrixKindList.map((kind) =>
              MatrixListByKind[kind].map((matrix) => ({
                label: `${MatrixLabels[matrix]} (${MatrixKindLabels[kind]})`,
                value: matrix
              }))
            )
              .flat()
              .filter((option) => !excludedMatrixList.includes(option.value))
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
