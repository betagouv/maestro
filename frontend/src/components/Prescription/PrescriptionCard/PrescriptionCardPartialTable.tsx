import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
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
  onChangeRegionalPrescriptionCount: (
    regionalPrescriptionId: string,
    value: number
  ) => void;
  start: number;
  end?: number;
}

const PrescriptionCardPartialTable = ({
  programmingPlan,
  matrixKind,
  regionalPrescriptions,
  onChangeRegionalPrescriptionCount,
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
          .sort(RegionalPrescriptionSort)
          .slice(start, end)
          .map((regionalPrescription) => (
            <RegionalPrescriptionCountCell
              programmingPlan={programmingPlan}
              matrixKind={matrixKind}
              regionalPrescription={regionalPrescription}
              onChange={async (value) =>
                onChangeRegionalPrescriptionCount(
                  regionalPrescription.id,
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
