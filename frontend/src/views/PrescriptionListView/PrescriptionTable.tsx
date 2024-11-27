import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region } from 'shared/referential/Region';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription,
  RegionalPrescriptionSort
} from 'shared/schema/RegionalPrescription/RegionalPrescription';
import { isNotEmpty } from 'shared/utils/utils';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import PrescriptionSubstancesSummary from 'src/components/Prescription/PrescriptionSubstances/PrescriptionSubstancesSummary';
import RegionalPrescriptionCountCell from 'src/components/Prescription/RegionalPrescriptionCountCell/RegionalPrescriptionCountCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useFindLaboratoriesQuery } from 'src/services/laboratory.service';
import RemoveMatrix from 'src/views/PrescriptionListView/RemoveMatrix';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  regionalPrescriptions: RegionalPrescription[];
  regions: Region[];
  onChangeRegionalPrescriptionCount: (
    prescriptionId: string,
    region: Region,
    count: number
  ) => void;
  onChangePrescriptionLaboratory: (
    prescriptionId: string,
    laboratoryId?: string
  ) => void;
  onRemovePrescription: (prescriptionId: string) => Promise<void>;
}

const PrescriptionTable = ({
  programmingPlan,
  prescriptions,
  regionalPrescriptions,
  regions,
  onChangeRegionalPrescriptionCount,
  onChangePrescriptionLaboratory,
  onRemovePrescription
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();

  const getRegionalPrescriptions = (prescriptionId: string) =>
    regionalPrescriptions
      .filter((r) => r.prescriptionId === prescriptionId)
      .sort((a, b) => a.region.localeCompare(b.region));

  // @ts-ignore
  const { data: laboratories } = useFindLaboratoriesQuery(_, {
    skip: regions.length > 1
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const EmptyCell = <div></div>;

  const headers = useMemo(
    () =>
      [
        <></>,
        <div className={cx('fr-pl-0')}>Matrice</div>,
        <div>Stade(s) de prélèvement</div>,
        regions.length > 1 && <div className="border-left">Total</div>,
        ...regions.map((region) => (
          <div className="border-left" key={`header-${region}`}>
            <RegionHeaderCell region={region} />
          </div>
        )),
        regions.length === 1 && 'Laboratoire'
      ].filter(isNotEmpty),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  //
  // const regionalLaboratoryId = (
  //   regionalPrescriptions: RegionalPrescription[],
  //   region: Region
  // ) => regionalPrescriptions.find((r) => r.region === region)?.laboratoryId;

  const prescriptionsData = useMemo(
    () =>
      prescriptions.map((prescription) =>
        [
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
            <PrescriptionSubstancesSummary
              programmingPlan={programmingPlan}
              prescription={prescription}
            />
          </div>,
          <div key={`stages-${prescription.matrix}`} className={cx('fr-p-1w')}>
            <PrescriptionStages
              programmingPlan={programmingPlan}
              prescription={prescription}
            />
          </div>,
          regions.length > 1 && (
            <div
              className="border-left fr-text--bold"
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
                    {getCompletionRate(
                      getRegionalPrescriptions(prescription.id)
                    )}
                    %
                  </div>
                </>
              )}
            </div>
          ),
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
          // regions.length === 1 && (
          //   <div
          //     key={`laboratory-${prescription.matrix}`}
          //   >
          //     {programmingPlan.status === 'InProgress' &&
          //     hasPermission('updatePrescriptionLaboratory') ? (
          //       <EditableSelectCell
          //         options={laboratoriesOptions(laboratories)}
          //         initialValue={
          //           regionalLaboratoryId(prescription, regions[0]) ?? ''
          //         }
          //         onChange={(value) =>
          //           onChangePrescriptionLaboratory(
          //             regionalLaboratoryId(prescription, regions[0]) ?? '',
          //             value
          //           )
          //         }
          //       />
          //     ) : (
          //       <div>
          //         {laboratories?.find(
          //           (l) =>
          //             l.id === regionalLaboratoryId(prescription, regions[0])
          //         )?.name ?? '-'}
          //       </div>
          //     )}
          //   </div>
          // ),
        ].filter(isNotEmpty)
      ),
    [prescriptions, regionalPrescriptions, laboratories] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalData = useMemo(
    () =>
      [
        EmptyCell,
        <b>Total</b>,
        EmptyCell,
        regions.length > 1 && (
          <div className="border-left fr-text--bold">
            <div>{_.sumBy(regionalPrescriptions, 'sampleCount')}</div>
            {programmingPlan.status === 'Validated' && (
              <>
                <div>
                  {_.sumBy(regionalPrescriptions, 'realizedSampleCount')}
                </div>
                <div>{getCompletionRate(regionalPrescriptions)}%</div>
              </>
            )}
          </div>
        ),
        ...regions.map((region) => [
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
                <div>
                  {getCompletionRate(
                    regionalPrescriptions.filter((r) => r.region === region),
                    region
                  )}
                </div>
              </>
            )}
          </div>
        ]),
        regions.length === 1 && EmptyCell
      ].filter(isNotEmpty),
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
        className={clsx({ 'full-width': regions.length > 1 })}
      />
    </div>
  );
};

export default PrescriptionTable;
