import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import type {
  MatrixOperator,
  SubPlanMatrices
} from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import { type ReactNode, useMemo } from 'react';
import { AppHierarchicalSelection } from 'src/components/_app/AppHierarchicalSelection/AppHierarchicalSelection';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { assert, type Equals } from 'tsafe';
import {
  fromMatrixHierarchicalSelection,
  matrixHierarchy,
  toMatrixHierarchicalSelection
} from './matrixSelection';

const matrixSelectionModal = createModal({
  id: 'programming-sub-plan-matrix-selection-modal',
  isOpenedByDefault: false
});

const operatorLabels: Record<MatrixOperator, string> = {
  Or: 'Une parmi (ou)',
  And: 'Toutes (et)'
};

type Props = {
  matrices: SubPlanMatrices | null;
  label: ReactNode;
  required: boolean;
  disabled: boolean;
  errorMessage: string | undefined;
  onChange: (matrices: SubPlanMatrices | null) => void;
};

export const ProgrammingPlanMatrixSettings = ({
  matrices,
  label,
  required,
  disabled,
  errorMessage,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const matrixReferential = useMatrixReferential();
  const hierarchy = useMemo(
    () => matrixHierarchy(matrixReferential),
    [matrixReferential]
  );

  const operatorSegment = (operator: MatrixOperator) => ({
    label: operatorLabels[operator],
    nativeInputProps: {
      checked: matrices?.operator === operator,
      disabled,
      onChange: () => matrices && onChange({ ...matrices, operator })
    }
  });

  return (
    <AppHierarchicalSelection
      modal={matrixSelectionModal}
      label={label}
      required={required}
      disabled={disabled}
      errorMessage={errorMessage}
      texts={{
        add: 'Ajouter catégorie(s) de matrice',
        edit: 'Modifier les matrices',
        modalTitle: 'Matrices',
        search: 'Rechercher une matrice',
        allChildren: 'Toutes les matrices'
      }}
      hierarchy={hierarchy}
      selection={toMatrixHierarchicalSelection(matrices?.items ?? [])}
      header={
        (matrices?.items.length ?? 0) > 1 && (
          <SegmentedControl
            small
            hideLegend
            legend="Matrices à prélever"
            className={cx('fr-mb-1w')}
            segments={[operatorSegment('Or'), operatorSegment('And')]}
          />
        )
      }
      onChange={(selection) => {
        const items = fromMatrixHierarchicalSelection(selection);
        onChange(
          items.length === 0
            ? null
            : {
                operator:
                  items.length > 1 ? (matrices?.operator ?? 'Or') : 'Or',
                items
              }
        );
      }}
    />
  );
};
