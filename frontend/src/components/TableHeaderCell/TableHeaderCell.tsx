import clsx from 'clsx';

interface Props {
  name: string;
  shortName?: string;
}

const TableHeaderCell = ({ name, shortName }: Props) => {
  const tooltipId = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      <span
        className={clsx('pointer', 'no-wrap')}
        aria-describedby={`tooltip-${tooltipId}`}
      >
        {shortName || name}
      </span>
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
