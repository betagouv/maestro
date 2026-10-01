import Tag from '@codegouvfr/react-dsfr/Tag';
import type { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { assert, type Equals } from 'tsafe';
import './MatrixTag.scss';

type Props = {
  matrix: Matrix;
  onDismiss: (() => void) | undefined;
};

export const MatrixTag = ({ matrix, onDismiss, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return onDismiss ? (
    <Tag
      small
      dismissible
      className="matrix-tag"
      nativeButtonProps={{ onClick: onDismiss }}
    >
      {MatrixLabels[matrix]}
    </Tag>
  ) : (
    <Tag small className="matrix-tag">
      {MatrixLabels[matrix]}
    </Tag>
  );
};
