import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { assert, type Equals } from 'tsafe';
import { MatrixTag } from './MatrixTag';
import {
  type MatrixSelection,
  removeMatrixKind,
  toggleMatrix
} from './matrixSelection';

type Props = {
  selection: MatrixSelection;
  onChange: (selection: MatrixSelection) => void;
};

export const MatrixSelectionRows = ({
  selection,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div style={{ width: '100%' }}>
      {selection.map(({ matrixKind, matrices }, index) => (
        <div
          key={matrixKind}
          className={clsx(
            'd-flex-row',
            'd-flex-justify-between',
            cx('fr-py-1w'),
            index > 0 && 'border-top'
          )}
          style={{ gap: '1rem' }}
        >
          <div>
            <Tag
              small
              dismissible
              nativeButtonProps={{
                onClick: () => onChange(removeMatrixKind(selection, matrixKind))
              }}
            >
              {MatrixKindLabels[matrixKind]}
            </Tag>
          </div>
          <div
            className={clsx('d-flex-row', 'd-flex-justify-end')}
            style={{ flexWrap: 'wrap', gap: '0.5rem' }}
          >
            {matrices.length === 0 ? (
              <i className={clsx(cx('fr-text--sm', 'fr-mb-0'), 'text-grey')}>
                Toutes les matrices
              </i>
            ) : (
              matrices.map((matrix) => (
                <MatrixTag
                  key={matrix}
                  matrix={matrix}
                  onDismiss={() =>
                    onChange(toggleMatrix(selection, matrixKind, matrix))
                  }
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
