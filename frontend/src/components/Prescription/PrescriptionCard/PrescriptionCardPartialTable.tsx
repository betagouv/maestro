import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { RegionList, Regions } from 'shared/referential/Region';
import { RegionalPrescription } from 'shared/schema/Prescription/RegionalPrescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import RegionalPrescriptionCountCell from 'src/components/Prescription/RegionalPrescriptionCountCell/RegionalPrescriptionCountCell';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalPrescriptionCount: (
    prescriptionId: string,
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
  end,
}: Props) => {
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
          .slice(start, end)
          .map((regionalPrescription) => (
            <RegionalPrescriptionCountCell
              programmingPlan={programmingPlan}
              regionalPrescription={regionalPrescription}
              onChange={async (value) =>
                onChangeRegionalPrescriptionCount(
                  regionalPrescription.id,
                  value
                )
              }
            />
          )),
      ]}
      className={cx('fr-mb-3w')}
    />
  );
};

export default PrescriptionCardPartialTable;
