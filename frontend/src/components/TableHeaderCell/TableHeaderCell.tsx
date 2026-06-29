import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';

interface Props {
  name: string;
  shortName?: string;
}

const TableHeaderCell = ({ name, shortName }: Props) => {
  return (
    <>
      <div>
        <span className={clsx('no-wrap')}>{shortName || name}</span>
      </div>
      <div
        className={cx('fr-text--xs', 'fr-text--light')}
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {name}
      </div>
    </>
  );
};

export default TableHeaderCell;
