import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import type {
  MatrixOperator,
  SubPlanMatrices
} from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { assert, type Equals } from 'tsafe';
import { MatrixSelectionModal } from './MatrixSelectionModal';
import { MatrixSelectionRows } from './MatrixSelectionRows';
import type { MatrixSelection } from './matrixSelection';

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
  errorMessage: string | undefined;
  onChange: (matrices: SubPlanMatrices | null) => void;
};

export const ProgrammingPlanMatrixSettings = ({
  matrices,
  errorMessage,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const selection = matrices?.items ?? [];

  const changeSelection = (items: MatrixSelection) =>
    onChange(
      items.length === 0
        ? null
        : {
            operator: items.length > 1 ? (matrices?.operator ?? 'Or') : 'Or',
            items
          }
    );

  const operatorSegment = (operator: MatrixOperator) => ({
    label: operatorLabels[operator],
    nativeInputProps: {
      checked: matrices?.operator === operator,
      onChange: () => matrices && onChange({ ...matrices, operator })
    }
  });

  return (
    <div className={clsx('border', cx('fr-p-2w'))}>
      <span className={cx('fr-label', 'fr-mb-1w')}>
        Matrice(s)
        <AppRequiredInput />
      </span>
      {matrices === null ? (
        <Button
          iconId="fr-icon-add-line"
          priority="secondary"
          size="small"
          onClick={() => matrixSelectionModal.open()}
        >
          Ajouter catégorie(s) de matrice
        </Button>
      ) : (
        <>
          {matrices.items.length > 1 && (
            <SegmentedControl
              small
              hideLegend
              legend="Matrices à prélever"
              className={cx('fr-mb-1w')}
              segments={[operatorSegment('Or'), operatorSegment('And')]}
            />
          )}
          <MatrixSelectionRows
            selection={selection}
            onChange={changeSelection}
          />
          <div className={clsx('border-top', cx('fr-pt-2w'))}>
            <Button
              iconId="fr-icon-edit-line"
              priority="secondary"
              size="small"
              title="Modifier"
              onClick={() => matrixSelectionModal.open()}
            />
          </div>
        </>
      )}
      {errorMessage && <p className={cx('fr-error-text')}>{errorMessage}</p>}
      <MatrixSelectionModal
        modal={matrixSelectionModal}
        selection={selection}
        onSave={changeSelection}
      />
    </div>
  );
};
