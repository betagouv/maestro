import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import DistributionCountCell from 'src/components/DistributionTable/DistributionCountCell/DistributionCountCell';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../../hooks/useAuthentication';
import '../PrescriptionCard/PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  matrixKind: MatrixKind;
  regionalPrescriptions: LocalPrescription[];
  onChangeRegionalCount: (region: Region, value: number) => void;
  start: number;
  end?: number;
}

const PrescriptionDistributionTable = ({
  programmingPlan,
  matrixKind,
  regionalPrescriptions,
  onChangeRegionalCount,
  start,
  end,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const { hasUserLocalPrescriptionPermission } = useAuthentication();

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
          .sort(LocalPrescriptionSort)
          .slice(start, end)
          .map((regionalPrescription) => (
            <DistributionCountCell
              key={`${regionalPrescription.prescriptionId}-${regionalPrescription.region}`}
              programmingPlan={programmingPlan}
              matrixKind={matrixKind}
              localPrescription={regionalPrescription}
              onChange={async (value) =>
                onChangeRegionalCount(regionalPrescription.region, value)
              }
              isEditable={
                hasUserLocalPrescriptionPermission(
                  programmingPlan,
                  regionalPrescription
                )?.updateSampleCount
              }
            />
          ))
      ]}
      className={cx('fr-mb-3w', 'fr-mt-1v')}
    />
  );
};

export default PrescriptionDistributionTable;
