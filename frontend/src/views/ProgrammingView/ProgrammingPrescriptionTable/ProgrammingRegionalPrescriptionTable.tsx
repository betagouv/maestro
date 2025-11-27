import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  getPrescriptionTitle,
  Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import DistributionCountCell from 'src/components/DistributionCountCell/DistributionCountCell';
import TableHeaderCell from 'src/components/TableHeaderCell/TableHeaderCell';
import { useAuthentication } from '../../../hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  regionalPrescriptions: LocalPrescription[];
  onChangeLocalPrescriptionCount: (
    key: LocalPrescriptionKey,
    count: number
  ) => void;
}

const ProgrammingRegionalPrescriptionTable = ({
  programmingPlan,
  prescriptions,
  regionalPrescriptions,
  onChangeLocalPrescriptionCount
}: Props) => {
  const { hasUserLocalPrescriptionPermission } = useAuthentication();

  const getLocalPrescriptions = (prescriptionId: string) =>
    regionalPrescriptions
      .filter((r) => r.prescriptionId === prescriptionId)
      .sort(LocalPrescriptionSort);

  const headers = useMemo(
    () => [
      <div key={'matrice'}>Matrice</div>,
      <div key={'total'} className="border-left">
        Total
      </div>,
      ...RegionList.map((region) => (
        <div className="border-left" key={`header-${region}`}>
          <TableHeaderCell
            shortName={Regions[region].shortName}
            name={Regions[region].name}
          />
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
          data-testid={`matrix-${prescription.id}`}
          key={`matrix-${prescription.id}`}
        >
          {getPrescriptionTitle(prescription)}
        </div>,
        <div
          className={clsx(cx('fr-text--bold'), 'border-left', 'sample-count')}
          key={`total-${prescription.id}`}
        >
          <div>
            {sumBy(
              getLocalPrescriptions(prescription.id),
              ({ sampleCount }) => sampleCount
            )}
          </div>
          {programmingPlan.regionalStatus.some(
            (_) => _.status === 'Validated'
          ) && (
            <>
              <div>
                {sumBy(
                  getLocalPrescriptions(prescription.id),
                  'realizedSampleCount'
                )}
              </div>
              <div>
                <CompletionBadge
                  localPrescriptions={getLocalPrescriptions(prescription.id)}
                />
              </div>
            </>
          )}
        </div>,
        ...getLocalPrescriptions(prescription.id)
          .sort(LocalPrescriptionSort)
          .map((regionalPrescription) => (
            <div
              className="border-left"
              data-testid={`cell-${prescription.id}`}
              key={`cell-${prescription.id}-${regionalPrescription.region}`}
            >
              <DistributionCountCell
                programmingPlan={programmingPlan}
                prescription={prescription}
                localPrescription={regionalPrescription}
                isEditable={
                  hasUserLocalPrescriptionPermission(
                    programmingPlan,
                    regionalPrescription
                  )?.updateSampleCount
                }
                onChange={async (value) =>
                  onChangeLocalPrescriptionCount(
                    {
                      prescriptionId: regionalPrescription.prescriptionId,
                      region: regionalPrescription.region
                    },
                    value
                  )
                }
              />
            </div>
          ))
      ]),
    [programmingPlan, prescriptions, regionalPrescriptions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalData = useMemo(
    () => [
      <b key={'total'}>Total</b>,
      // eslint-disable-next-line react/jsx-key
      <div className="border-left fr-text--bold">
        <div>{sumBy(regionalPrescriptions, 'sampleCount')}</div>

        {programmingPlan.regionalStatus.some(
          (_) => _.status === 'Validated'
        ) && (
          <>
            <div>{sumBy(regionalPrescriptions, 'realizedSampleCount')}</div>
            <CompletionBadge localPrescriptions={regionalPrescriptions} />
          </>
        )}
      </div>,
      ...RegionList.map((region) => [
        <div key={`total-${region}`} className="border-left fr-text--bold">
          <div>
            {sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'sampleCount'
            )}
          </div>
          {programmingPlan.regionalStatus.some(
            (_) => _.region === region && _.status === 'Validated'
          ) && (
            <>
              <div>
                {sumBy(
                  regionalPrescriptions.filter((r) => r.region === region),
                  'realizedSampleCount'
                )}
              </div>
              <CompletionBadge
                localPrescriptions={regionalPrescriptions}
                region={region}
              />
            </>
          )}
        </div>
      ])
    ],
    [regionalPrescriptions, prescriptions, programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
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

export default ProgrammingRegionalPrescriptionTable;
