import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import {
  Department,
  DepartmentLabels,
  DepartmentList
} from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useMemo } from 'react';
import DistributionCountCell from 'src/components/DistributionTable/DistributionCountCell/DistributionCountCell';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../../hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription: RegionalPrescription;
  departmentalPrescriptions: RegionalPrescription[];
  onChangeDepartmentalCount: (department: Department, value: number) => void;
  displayedPart: 'first' | 'second';
}

const RegionalPrescriptionDistributionTable = ({
  programmingPlan,
  prescription,
  regionalPrescription,
  departmentalPrescriptions,
  onChangeDepartmentalCount,
  displayedPart,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();

  const departmentList = useMemo(
    () =>
      DepartmentList.filter((_) =>
        Regions[regionalPrescription.region].departments.includes(_)
      ),
    [regionalPrescription]
  );

  const start = useMemo(
    () =>
      displayedPart === 'first' ? 0 : Math.ceil(departmentList.length / 2),
    [displayedPart, departmentList]
  );

  const end = useMemo(
    () =>
      displayedPart === 'first'
        ? Math.ceil(departmentList.length / 2)
        : departmentList.length,
    [displayedPart, departmentList]
  );

  return (
    <Table
      bordered={false}
      noCaption
      noScroll
      fixed
      headers={departmentList.slice(start, end).map((department) => (
        <span key={`${Math.random()}_header_${department}`} className="no-wrap">
          {department} - {DepartmentLabels[department]}
        </span>
      ))}
      data={[
        departmentalPrescriptions
          .slice(start, end)
          .map((regionalPrescription) => (
            <DistributionCountCell
              key={`${regionalPrescription.prescriptionId}-${regionalPrescription.region}`}
              programmingPlan={programmingPlan}
              matrixKind={prescription.matrixKind}
              regionalPrescription={regionalPrescription}
              isEditable={
                hasUserRegionalPrescriptionPermission(
                  programmingPlan,
                  regionalPrescription
                )?.distributeToDepartments
              }
              onChange={async (value) =>
                onChangeDepartmentalCount(
                  regionalPrescription.department as Department,
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

export default RegionalPrescriptionDistributionTable;
