import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { matrixKindLabel } from 'maestro-shared/schema/Matrix/MatrixReferential';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { assert, type Equals } from 'tsafe';
import { MatrixTag } from './MatrixTag';
import {
  type MatrixSelection,
  removeMatrixKind,
  toggleMatrix
} from './matrixSelection';

type Props = {
  selection: MatrixSelection;
  disabled?: boolean;
  onChange: (selection: MatrixSelection) => void;
};

export const MatrixSelectionRows = ({
  selection,
  disabled,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const matrixReferential = useMatrixReferential();

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
            {disabled ? (
              <Tag small>{matrixKindLabel(matrixReferential, matrixKind)}</Tag>
            ) : (
              <Tag
                small
                dismissible
                nativeButtonProps={{
                  onClick: () =>
                    onChange(removeMatrixKind(selection, matrixKind))
                }}
              >
                {matrixKindLabel(matrixReferential, matrixKind)}
              </Tag>
            )}
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
                  onDismiss={
                    disabled
                      ? undefined
                      : () =>
                          onChange(
                            toggleMatrix(
                              matrixReferential,
                              selection,
                              matrixKind,
                              matrix
                            )
                          )
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
