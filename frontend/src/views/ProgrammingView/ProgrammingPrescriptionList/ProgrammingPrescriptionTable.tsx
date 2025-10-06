import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import {
  LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import DistributionCountCell from 'src/components/DistributionTable/DistributionCountCell/DistributionCountCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { useAuthentication } from '../../../hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  regionalPrescriptions: LocalPrescription[];
  onChangeLocalPrescriptionCount: (
    prescription: Prescription,
    region: Region,
    count: number
  ) => void;
}

const ProgrammingPrescriptionTable = ({
  programmingPlan,
  prescriptions,
  regionalPrescriptions,
  onChangeLocalPrescriptionCount
}: Props) => {
  const { hasUserLocalPrescriptionPermission } = useAuthentication();

  const getLocalPrescriptions = (prescriptionId: string) =>
    regionalPrescriptions
      .filter((r) => r.prescriptionId === prescriptionId)
      .sort((a, b) => a.region.localeCompare(b.region));

  const headers = useMemo(
    () => [
      <div key={'matrice'}>Matrice</div>,
      <div key={'total'} className="border-left">
        Total
      </div>,
      ...RegionList.map((region) => (
        <div className="border-left" key={`header-${region}`}>
          <RegionHeaderCell region={region} />
        </div>
      ))
    ],
    []
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
            {sumBy(
              getLocalPrescriptions(prescription.id),
              ({ sampleCount }) => sampleCount
            )}
          </div>
          <div>
            {sumBy(
              getLocalPrescriptions(prescription.id),
              'realizedSampleCount'
            )}
          </div>
          <div>
            <CompletionBadge
              regionalPrescriptions={getLocalPrescriptions(prescription.id)}
            />
          </div>
        </div>,
        ...getLocalPrescriptions(prescription.id)
          .sort(LocalPrescriptionSort)
          .map((regionalPrescription) => (
            <div
              className="border-left"
              data-testid={`cell-${prescription.matrixKind}`}
              key={`cell-${prescription.matrixKind}-${regionalPrescription.region}`}
            >
              <DistributionCountCell
                programmingPlan={programmingPlan}
                matrixKind={prescription.matrixKind}
                regionalPrescription={regionalPrescription}
                isEditable={
                  hasUserLocalPrescriptionPermission(
                    programmingPlan,
                    regionalPrescription
                  )?.updateSampleCount
                }
                onChange={async (value) =>
                  onChangeLocalPrescriptionCount(
                    prescription,
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
      <b key={'total'}>Total</b>,
      // eslint-disable-next-line react/jsx-key
      <div className="border-left fr-text--bold">
        <div>{sumBy(regionalPrescriptions, 'sampleCount')}</div>
        <div>{sumBy(regionalPrescriptions, 'realizedSampleCount')}</div>
        <CompletionBadge regionalPrescriptions={regionalPrescriptions} />
      </div>,
      ...RegionList.map((region) => [
        <div key={`total-${region}`} className="border-left fr-text--bold">
          <div>
            {sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'sampleCount'
            )}
          </div>
          {programmingPlan.regionalStatus.find((_) => _.region === region)
            ?.status === 'Validated' && (
            <>
              <div>
                {sumBy(
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

export default ProgrammingPrescriptionTable;
