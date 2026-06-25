import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';

interface Props {
  name: string;
  shortName?: string;
}

const TableHeaderCell = ({ name, shortName }: Props) => {
  const tooltipId = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      <div>
        <span
          className={clsx('pointer', 'no-wrap')}
          aria-describedby={`tooltip-${tooltipId}`}
        >
          {shortName || name}
        </span>
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
      <span
        className="fr-tooltip fr-placement"
        id={`tooltip-${tooltipId}`}
        role="tooltip"
        aria-hidden="true"
      >
        {name}
      </span>
    </>
  );
};

export default TableHeaderCell;
