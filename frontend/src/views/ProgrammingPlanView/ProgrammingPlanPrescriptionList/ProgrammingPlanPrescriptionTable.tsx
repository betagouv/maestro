import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  RegionalPrescription,
  RegionalPrescriptionSort
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useMemo } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import RegionalPrescriptionCountCell from 'src/components/Prescription/RegionalPrescriptionCountCell/RegionalPrescriptionCountCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalPrescriptionCount: (
    prescriptionId: string,
    region: Region,
    count: number
  ) => void;
}

const ProgrammingPlanPrescriptionTable = ({
  programmingPlan,
  prescriptions,
  regionalPrescriptions,
  onChangeRegionalPrescriptionCount
}: Props) => {
  const getRegionalPrescriptions = (prescriptionId: string) =>
    regionalPrescriptions
      .filter((r) => r.prescriptionId === prescriptionId)
      .sort((a, b) => a.region.localeCompare(b.region));

  const headers = useMemo(
    () => [
      <div>Matrice</div>,
      <div className="border-left">Total</div>,
      ...RegionList.map((region) => (
        <div className="border-left" key={`header-${region}`}>
          <RegionHeaderCell region={region} />
        </div>
      ))
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const prescriptionsData = useMemo(
    () =>
      prescriptions.map((prescription) => [
        <div
          className={cx('fr-text--bold')}
          data-testid={`matrix-${prescription.matrixKind}`}
          key={`matrix-${prescription.matrixKind}`}
        >
          {MatrixKindLabels[prescription.matrixKind]}
        </div>,
        <div
          className={clsx(cx('fr-text--bold'), 'border-left', 'sample-count')}
          key={`total-${prescription.matrixKind}`}
        >
          <div>
            {_.sumBy(
              getRegionalPrescriptions(prescription.id),
              ({ sampleCount }) => sampleCount
            )}
          </div>
          <div>
            {_.sumBy(
              getRegionalPrescriptions(prescription.id),
              'realizedSampleCount'
            )}
          </div>
          <div>
            <CompletionBadge
              regionalPrescriptions={getRegionalPrescriptions(prescription.id)}
            />
          </div>
        </div>,
        ...getRegionalPrescriptions(prescription.id)
          .sort(RegionalPrescriptionSort)
          .map((regionalPrescription) => (
            <div
              className="border-left"
              data-testid={`cell-${prescription.matrixKind}`}
              key={`cell-${prescription.matrixKind}-${regionalPrescription.region}`}
            >
              <RegionalPrescriptionCountCell
                programmingPlan={programmingPlan}
                matrixKind={prescription.matrixKind}
                regionalPrescription={regionalPrescription}
                onChange={async (value) =>
                  onChangeRegionalPrescriptionCount(
                    regionalPrescription.prescriptionId,
                    regionalPrescription.region,
                    value
                  )
                }
              />
            </div>
          ))
      ]),
    [prescriptions, regionalPrescriptions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalData = useMemo(
    () => [
      <b>Total</b>,
      <div className="border-left fr-text--bold">
        <div>{_.sumBy(regionalPrescriptions, 'sampleCount')}</div>
        <div>{_.sumBy(regionalPrescriptions, 'realizedSampleCount')}</div>
        <CompletionBadge regionalPrescriptions={regionalPrescriptions} />
      </div>,
      ...RegionList.map((region) => [
        <div key={`total-${region}`} className="border-left fr-text--bold">
          <div>
            {_.sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'sampleCount'
            )}
          </div>
          {programmingPlan.regionalStatus.find((_) => _.region === region)
            ?.status === 'Validated' && (
            <>
              <div>
                {_.sumBy(
                  regionalPrescriptions.filter((r) => r.region === region),
                  'realizedSampleCount'
                )}
              </div>
              <CompletionBadge
                regionalPrescriptions={regionalPrescriptions}
                region={region}
              />
            </>
          )}
        </div>
      ])
    ],
    [regionalPrescriptions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!prescriptions) {
    return <></>;
  }

  return (
    <div data-testid="prescription-table">
      <Table
        bordered
        noCaption
        headers={headers}
        data={[...prescriptionsData, totalData]}
        className="full-width"
      />
    </div>
  );
};

export default ProgrammingPlanPrescriptionTable;
