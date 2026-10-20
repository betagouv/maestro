import Tag from '@codegouvfr/react-dsfr/Tag';
import {
  type Matrix,
  matrixLabel
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { assert, type Equals } from 'tsafe';
import './MatrixTag.scss';

type Props = {
  matrix: Matrix;
  onDismiss: (() => void) | undefined;
};

export const MatrixTag = ({ matrix, onDismiss, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const matrixReferential = useMatrixReferential();

  return onDismiss ? (
    <Tag
      small
      dismissible
      className="matrix-tag"
      nativeButtonProps={{ onClick: onDismiss }}
    >
      {matrixLabel(matrixReferential, matrix)}
    </Tag>
  ) : (
    <Tag small className="matrix-tag">
      {matrixLabel(matrixReferential, matrix)}
    </Tag>
  );
};
