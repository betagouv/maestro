import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import clsx from 'clsx';
import {
  type MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { isMatrixSelected } from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import { useMemo, useState } from 'react';
import { AppSelectionModal } from 'src/components/_app/AppSelectionModal/AppSelectionModal';
import { assert, type Equals } from 'tsafe';
import './MatrixSelectionModal.scss';
import { MatrixSelectionRows } from './MatrixSelectionRows';
import {
  filterMatrixKinds,
  type MatrixSelection,
  subMatrices,
  toggleMatrix,
  toggleMatrixKind
} from './matrixSelection';

type Props = {
  modal: ReturnType<typeof createModal>;
  selection: MatrixSelection;
  onSave: (selection: MatrixSelection) => void;
};

export const MatrixSelectionModal = ({
  modal,
  selection,
  onSave,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [draft, setDraft] = useState<MatrixSelection>(selection);
  const [search, setSearch] = useState('');
  const [expandedMatrixKinds, setExpandedMatrixKinds] = useState<MatrixKind[]>(
    []
  );

  useIsModalOpen(modal, {
    onDisclose: () => setDraft(selection),
    onConceal: () => {
      setSearch('');
      setExpandedMatrixKinds([]);
    }
  });

  const options = useMemo(() => filterMatrixKinds(search), [search]);

  const toggleExpanded = (matrixKind: MatrixKind) =>
    setExpandedMatrixKinds((expanded) =>
      expanded.includes(matrixKind)
        ? expanded.filter((kind) => kind !== matrixKind)
        : [...expanded, matrixKind]
    );

  return (
    <AppSelectionModal
      modal={modal}
      title="Matrices"
      buttons={[
        {
          children: 'Tout désélectionner',
          iconId: 'fr-icon-close-circle-line',
          priority: 'tertiary no outline',
          className: 'link-underline',
          doClosesModal: false,
          onClick: () => setDraft([])
        },
        {
          children: 'Enregistrer',
          priority: 'primary',
          doClosesModal: false,
          onClick: () => {
            onSave(draft);
            modal.close();
          }
        }
      ]}
      searchLabel="Rechercher une matrice"
      search={search}
      onSearchChange={setSearch}
      selection={<MatrixSelectionRows selection={draft} onChange={setDraft} />}
    >
      {options.map(({ matrixKind, matrices, matchedByMatrix }) => {
        const selected = draft.find((item) => item.matrixKind === matrixKind);
        const matrixCount = subMatrices(matrixKind).length;
        const expanded =
          matchedByMatrix || expandedMatrixKinds.includes(matrixKind);
        return (
          <div key={matrixKind} className="border-bottom">
            <div className="d-flex-row d-flex-align-center d-flex-justify-between">
              <Checkbox
                small
                className={clsx(cx('fr-my-1w'), 'matrix-selection-modal__kind')}
                options={[
                  {
                    label: (
                      <span>
                        <b>{MatrixKindLabels[matrixKind]}</b>
                        {matrixCount > 0 && ` (${matrixCount})`}
                      </span>
                    ),
                    nativeInputProps: {
                      checked: selected?.matrices.length === 0,
                      ref: (input: HTMLInputElement | null) => {
                        if (input) {
                          input.indeterminate =
                            (selected?.matrices.length ?? 0) > 0;
                        }
                      },
                      onChange: () =>
                        setDraft(toggleMatrixKind(draft, matrixKind))
                    }
                  }
                ]}
              />
              {matrixCount > 0 && (
                <Button
                  iconId={
                    expanded
                      ? 'fr-icon-arrow-up-s-line'
                      : 'fr-icon-arrow-down-s-line'
                  }
                  priority="tertiary no outline"
                  size="small"
                  title={
                    expanded
                      ? `Replier ${MatrixKindLabels[matrixKind]}`
                      : `Déplier ${MatrixKindLabels[matrixKind]}`
                  }
                  onClick={() => toggleExpanded(matrixKind)}
                />
              )}
            </div>
            {expanded && (
              <Checkbox
                small
                className={clsx(
                  cx('fr-ml-3w', 'fr-mb-1w'),
                  'matrix-selection-modal__matrices'
                )}
                options={matrices.map((matrix) => ({
                  label: MatrixLabels[matrix],
                  nativeInputProps: {
                    checked: isMatrixSelected(selected, matrix),
                    onChange: () =>
                      setDraft(toggleMatrix(draft, matrixKind, matrix))
                  }
                }))}
              />
            )}
          </div>
        );
      })}
    </AppSelectionModal>
  );
};
