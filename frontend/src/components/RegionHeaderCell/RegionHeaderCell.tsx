import { Region, Regions } from 'shared/referential/Region';

interface RegionHeaderCellProps {
  region: Region;
}

const RegionHeaderCell = ({ region }: RegionHeaderCellProps) => {
  return (
    <>
      <span className="pointer" aria-describedby={`tooltip-${region}`}>
        {Regions[region].shortName}
      </span>
      <span
        className="fr-tooltip fr-placement"
        id={`tooltip-${region}`}
        role="tooltip"
        aria-hidden="true"
      >
        {Regions[region].name}
      </span>
    </>
  );
};

export default RegionHeaderCell;
