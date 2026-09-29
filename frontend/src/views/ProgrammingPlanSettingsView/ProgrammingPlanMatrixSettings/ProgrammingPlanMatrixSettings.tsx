import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { assert, type Equals } from 'tsafe';
import { MatrixSelectionModal } from './MatrixSelectionModal';
import { MatrixSelectionRows } from './MatrixSelectionRows';
import type { MatrixSelection } from './matrixSelection';

const matrixSelectionModal = createModal({
  id: 'programming-sub-plan-matrix-selection-modal',
  isOpenedByDefault: false
});

type Props = {
  selection: MatrixSelection;
  onChange: (selection: MatrixSelection) => void;
};

export const ProgrammingPlanMatrixSettings = ({
  selection,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className={clsx('border', cx('fr-p-2w'))}>
      <span className={cx('fr-label', 'fr-mb-1w')}>
        Matrice(s)
        <AppRequiredInput />
      </span>
      {selection.length === 0 ? (
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
          <MatrixSelectionRows selection={selection} onChange={onChange} />
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
      <MatrixSelectionModal
        modal={matrixSelectionModal}
        selection={selection}
        onSave={onChange}
      />
    </div>
  );
};
