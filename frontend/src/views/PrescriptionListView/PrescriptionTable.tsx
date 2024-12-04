import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, RegionList } from 'shared/referential/Region';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  RegionalPrescription,
  RegionalPrescriptionSort
} from 'shared/schema/RegionalPrescription/RegionalPrescription';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import PrescriptionSubstancesModalButtons from 'src/components/Prescription/PrescriptionSubstancesModal/PrescriptionSubstancesModalButtons';
import RegionalPrescriptionCountCell from 'src/components/Prescription/RegionalPrescriptionCountCell/RegionalPrescriptionCountCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { useAuthentication } from 'src/hooks/useAuthentication';
import RemoveMatrix from 'src/views/PrescriptionListView/RemoveMatrix';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalPrescriptionCount: (
    prescriptionId: string,
    region: Region,
    count: number
  ) => void;
  onRemovePrescription: (prescriptionId: string) => Promise<void>;
}

const PrescriptionTable = ({
  programmingPlan,
  prescriptions,
  regionalPrescriptions,
  onChangeRegionalPrescriptionCount,
  onRemovePrescription
}: Props) => {
  const { hasUserPermission, hasUserPrescriptionPermission } =
    useAuthentication();

  const getRegionalPrescriptions = (prescriptionId: string) =>
    regionalPrescriptions
      .filter((r) => r.prescriptionId === prescriptionId)
      .sort((a, b) => a.region.localeCompare(b.region));

  const EmptyCell = <div></div>;

  const headers = useMemo(
    () => [
      <></>,
      <div className={cx('fr-pl-0')}>Matrice</div>,
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
        <div key={`remove-${prescription.matrix}`}>
          {hasUserPrescriptionPermission(programmingPlan)?.delete && (
            <RemoveMatrix
              matrix={prescription.matrix}
              stages={prescription.stages}
              onRemove={() => onRemovePrescription(prescription.id)}
            />
          )}
        </div>,
        <div
          className={cx('fr-pl-0', 'fr-text--bold')}
          data-testid={`matrix-${prescription.matrix}`}
          key={`matrix-${prescription.matrix}`}
        >
          {MatrixLabels[prescription.matrix]}
          {hasUserPermission('updatePrescription') && (
            <PrescriptionSubstancesModalButtons
              programmingPlan={programmingPlan}
              prescription={prescription}
            />
          )}
          <hr className={cx('fr-my-1w')} />
          <div key={`stages-${prescription.matrix}`}>
            <PrescriptionStages
              programmingPlan={programmingPlan}
              prescription={prescription}
            />
          </div>
        </div>,
        <div
          className={clsx(cx('fr-text--bold'), 'border-left', 'sample-count')}
          key={`total-${prescription.matrix}`}
        >
          <div>
            {_.sumBy(
              getRegionalPrescriptions(prescription.id),
              ({ sampleCount }) => sampleCount
            )}
          </div>
          {programmingPlan.status === 'Validated' && (
            <>
              <div>
                {_.sumBy(
                  getRegionalPrescriptions(prescription.id),
                  'realizedSampleCount'
                )}
              </div>
              <div>
                <CompletionBadge
                  regionalPrescriptions={getRegionalPrescriptions(
                    prescription.id
                  )}
                />
              </div>
            </>
          )}
        </div>,
        ...getRegionalPrescriptions(prescription.id)
          .sort(RegionalPrescriptionSort)
          .map((regionalPrescription) => (
            <div
              className="border-left"
              data-testid={`cell-${prescription.matrix}`}
              key={`cell-${prescription.matrix}-${regionalPrescription.region}`}
            >
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
            </div>
          ))
      ]),
    [prescriptions, regionalPrescriptions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalData = useMemo(
    () => [
      EmptyCell,
      <b>Total</b>,
      <div className="border-left fr-text--bold">
        <div>{_.sumBy(regionalPrescriptions, 'sampleCount')}</div>
        {programmingPlan.status === 'Validated' && (
          <>
            <div>{_.sumBy(regionalPrescriptions, 'realizedSampleCount')}</div>
            <CompletionBadge regionalPrescriptions={regionalPrescriptions} />
          </>
        )}
      </div>,
      ...RegionList.map((region) => [
        <div key={`total-${region}`} className="border-left fr-text--bold">
          <div>
            {_.sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'sampleCount'
            )}
          </div>
          {programmingPlan.status === 'Validated' && (
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

export default PrescriptionTable;
