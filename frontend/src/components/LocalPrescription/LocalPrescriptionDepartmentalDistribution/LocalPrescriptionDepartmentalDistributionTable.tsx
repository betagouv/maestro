import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { sumBy } from 'lodash-es';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
  DepartmentSort
} from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import {
  LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo } from 'react';
import DistributionCountCell from 'src/components/DistributionCountCell/DistributionCountCell';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../../hooks/useAuthentication';
import TableHeaderCell from '../../TableHeaderCell/TableHeaderCell';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription: LocalPrescription;
  departmentalPrescriptions: LocalPrescription[];
  onChangeDepartmentalCount: (department: Department, value: number) => void;
  displayedPart: 'first' | 'second';
}

const LocalPrescriptionDepartmentalDistributionTable = ({
  programmingPlan,
  prescription,
  regionalPrescription,
  departmentalPrescriptions,
  onChangeDepartmentalCount,
  displayedPart,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const { hasUserLocalPrescriptionPermission } = useAuthentication();

  const departmentList = useMemo(
    () =>
      [
        ...DepartmentList.filter((_) =>
          Regions[regionalPrescription.region].departments.includes(_)
        )
      ].sort(DepartmentSort),
    [regionalPrescription]
  );

  const start = useMemo(
    () =>
      displayedPart === 'first'
        ? 0
        : Math.max(Math.ceil(departmentList.length / 2), 5),
    [displayedPart, departmentList]
  );

  const end = useMemo(
    () =>
      displayedPart === 'first'
        ? Math.max(Math.ceil(departmentList.length / 2), 5)
        : departmentList.length,
    [displayedPart, departmentList]
  );

  if (start >= end) {
    return <></>;
  }

  return (
    <Table
      bordered={false}
      noCaption
      noScroll
      fixed
      headers={departmentList.slice(start, end).map((department) => (
        <TableHeaderCell
          key={`${Math.random()}_header_${department}`}
          name={`${department} - ${DepartmentLabels[department]}`}
        />
      ))}
      data={[
        [...departmentalPrescriptions]
          .sort(LocalPrescriptionSort)
          .slice(start, end)
          .map((departmentalPrescription) => (
            <DistributionCountCell
              key={`${departmentalPrescription.prescriptionId}-${departmentalPrescription.region}`}
              programmingPlan={programmingPlan}
              prescription={prescription}
              localPrescription={departmentalPrescription}
              max={
                regionalPrescription.sampleCount -
                sumBy(departmentalPrescriptions, 'sampleCount') +
                departmentalPrescription.sampleCount
              }
              isEditable={
                hasUserLocalPrescriptionPermission(
                  programmingPlan,
                  departmentalPrescription
                )?.distributeToDepartments
              }
              onChange={async (value) =>
                onChangeDepartmentalCount(
                  departmentalPrescription.department as Department,
                  value
                )
              }
            />
          ))
      ]}
      className={cx('fr-mb-3w', 'fr-mt-1v')}
    />
  );
};

export default LocalPrescriptionDepartmentalDistributionTable;
