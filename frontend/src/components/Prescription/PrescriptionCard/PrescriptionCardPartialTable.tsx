import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  RegionalPrescription,
  RegionalPrescriptionSort
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import RegionalPrescriptionCountCell from 'src/components/Prescription/RegionalPrescriptionCountCell/RegionalPrescriptionCountCell';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalPrescriptionCount: (
    prescriptionId: string,
    region: Region,
    value: number
  ) => void;
  start: number;
  end?: number;
}

const PrescriptionCardPartialTable = ({
  programmingPlan,
  regionalPrescriptions,
  onChangeRegionalPrescriptionCount,
  start,
  end
}: Props) => {
  if (!regionalPrescriptions) {
    return <></>;
  }

  return (
    <Table
      bordered={false}
      noCaption
      noScroll
      fixed
      headers={RegionList.slice(start, end).map((region) => (
        <div key={`${Math.random()}_header_${region}`}>
          {Regions[region].shortName}
        </div>
      ))}
      data={[
        regionalPrescriptions
          .sort(RegionalPrescriptionSort)
          .slice(start, end)
          .map((regionalPrescription) => (
            <RegionalPrescriptionCountCell
              programmingPlan={programmingPlan}
              regionalPrescription={regionalPrescription}
              onChange={async (value) =>
                onChangeRegionalPrescriptionCount(
                  regionalPrescription.prescriptionId,
                  regionalPrescription.region,
                  value
                )
              }
            />
          ))
      ]}
      className={cx('fr-mb-0')}
    />
  );
};

export default PrescriptionCardPartialTable;
