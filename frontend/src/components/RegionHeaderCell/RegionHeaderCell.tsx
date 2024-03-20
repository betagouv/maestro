import { Region, RegionLabels } from 'shared/schema/Region';

interface RegionHeaderCellProps {
  region: Region;
}

const RegionHeaderCell = ({ region }: RegionHeaderCellProps) => {
  return (
    <>
      <span className="pointer" aria-describedby={`tooltip-${region}`}>
        {region}
      </span>
      <span
        className="fr-tooltip fr-placement"
        id={`tooltip-${region}`}
        role="tooltip"
        aria-hidden="true"
      >
        {RegionLabels[region]}
      </span>
    </>
  );
};

export default RegionHeaderCell;
