import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  RegionalPrescription,
  RegionalPrescriptionSort
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import RegionalPrescriptionCountCell from 'src/components/Prescription/RegionalPrescriptionCountCell/RegionalPrescriptionCountCell';
import { assert, type Equals } from 'tsafe';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  matrixKind: MatrixKind;
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalCount: (region: Region, value: number) => void;
  start: number;
  end?: number;
}

const PrescriptionCardPartialTable = ({
  programmingPlan,
  matrixKind,
  regionalPrescriptions,
  onChangeRegionalCount,
  start,
  end,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
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
          .filter((_) => !_.department)
          .sort(RegionalPrescriptionSort)
          .slice(start, end)
          .map((regionalPrescription) => (
            <RegionalPrescriptionCountCell
              key={`${regionalPrescription.prescriptionId}-${regionalPrescription.region}`}
              programmingPlan={programmingPlan}
              matrixKind={matrixKind}
              regionalPrescription={regionalPrescription}
              onChange={async (value) =>
                onChangeRegionalCount(regionalPrescription.region, value)
              }
            />
          ))
      ]}
      className={cx('fr-mb-3w', 'fr-mt-1v')}
    />
  );
};

export default PrescriptionCardPartialTable;
