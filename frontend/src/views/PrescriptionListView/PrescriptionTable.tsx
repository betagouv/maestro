import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region } from 'shared/referential/Region';
import { StageLabels } from 'shared/referential/Stage';
import {
  matrixCompletionRate,
  PrescriptionByMatrix,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { Context } from 'shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { isNotEmpty } from 'shared/utils/utils';
import EditableSelectCell from 'src/components/EditableCell/EditableSelectCell';
import PrescriptionCountCell from 'src/components/Prescription/PrescriptionCountCell/PrescriptionCountCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { laboratoriesOptions } from 'src/components/_app/AppSelect/AppSelectOption';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useFindLaboratoriesQuery } from 'src/services/laboratory.service';
import RemoveMatrix from 'src/views/PrescriptionListView/RemoveMatrix';

interface Props {
  programmingPlan: ProgrammingPlan;
  context: Context;
  prescriptionsByMatrix: PrescriptionByMatrix[];
  samples: PartialSample[];
  regions: Region[];
  onChangePrescriptionCount: (prescriptionId: string, count: number) => void;
  onChangePrescriptionLaboratory: (
    prescriptionId: string,
    laboratoryId?: string
  ) => void;
  onRemovePrescriptionByMatrix: (
    prescriptionByMatrix: PrescriptionByMatrix
  ) => Promise<void>;
}

const PrescriptionTable = ({
  programmingPlan,
  prescriptionsByMatrix,
  regions,
  onChangePrescriptionCount,
  onChangePrescriptionLaboratory,
  onRemovePrescriptionByMatrix,
}: Props) => {
  const { hasPermission } = useAuthentication();

  // @ts-ignore
  const { data: laboratories } = useFindLaboratoriesQuery(_, {
    skip: regions.length > 1,
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
        regions.length === 1 && 'Laboratoire',
      ].filter(isNotEmpty),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const regionalLaboratoryId = (
    prescriptionByMatrix: PrescriptionByMatrix,
    region: Region
  ) =>
    prescriptionByMatrix.regionalData.find((r) => r.region === region)
      ?.laboratoryId;

  const prescriptionsData = useMemo(
    () =>
      prescriptionsByMatrix.map((p) =>
        [
          <div key={`remove-${p.matrix}-${p.stages}`}>
            {hasPermission('deletePrescription') &&
              programmingPlan.status === 'InProgress' && (
                <RemoveMatrix
                  matrix={p.matrix}
                  stages={p.stages}
                  onRemove={() => onRemovePrescriptionByMatrix(p)}
                />
              )}
          </div>,
          <div
            className={cx('fr-pl-0', 'fr-text--bold')}
            data-testid={`matrix-${p.matrix}-${p.stages}`}
            key={`matrix-${p.matrix}-${p.stages}`}
          >
            {MatrixLabels[p.matrix]}
          </div>,
          <ul key={`sampleStage-${p.matrix}-${p.stages}`}>
            {p.stages.map((stage) => (
              <li key={`sampleStage-${p.matrix}-${stage}`}>
                {StageLabels[stage]}
              </li>
            ))}
          </ul>,
          regions.length > 1 && (
            <div
              className="border-left fr-text--bold"
              key={`total-${p.matrix}-${p.stages}`}
            >
              <div>
                {_.sumBy(p.regionalData, ({ sampleCount }) => sampleCount)}
              </div>
              {programmingPlan.status === 'Validated' && (
                <>
                  <div>
                    {_.sumBy(
                      p.regionalData,
                      ({ sentSampleCount }) => sentSampleCount
                    )}
                  </div>
                  <div>{matrixCompletionRate(p)}%</div>
                </>
              )}
            </div>
          ),
          ...p.regionalData.map(
            ({
              sampleCount,
              sentSampleCount,
              region,
              prescriptionId,
              comments,
            }) => (
              <div
                className="border-left"
                data-testid={`cell-${p.matrix}`}
                key={`cell-${p.matrix}-${p.stages}-${region}`}
              >
                <PrescriptionCountCell
                  prescriptionId={prescriptionId}
                  programmingPlan={programmingPlan}
                  samplesCount={sampleCount}
                  sentSamplesCount={sentSampleCount}
                  completionRate={matrixCompletionRate(p, region)}
                  comments={comments}
                  onChange={async (value) =>
                    onChangePrescriptionCount(prescriptionId, value)
                  }
                />
              </div>
            )
          ),
          regions.length === 1 && (
            <div key={`laboratory-${p.matrix}-${p.stages}`}>
              {programmingPlan.status === 'InProgress' &&
              hasPermission('updatePrescriptionLaboratory') ? (
                <EditableSelectCell
                  options={laboratoriesOptions(laboratories)}
                  initialValue={regionalLaboratoryId(p, regions[0]) ?? ''}
                  onChange={(value) =>
                    onChangePrescriptionLaboratory(
                      regionalLaboratoryId(p, regions[0]) ?? '',
                      value
                    )
                  }
                />
              ) : (
                <div>
                  {laboratories?.find(
                    (l) => l.id === regionalLaboratoryId(p, regions[0])
                  )?.name ?? '-'}
                </div>
              )}
            </div>
          ),
        ].filter(isNotEmpty)
      ),
    [prescriptionsByMatrix, laboratories] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalData = useMemo(
    () =>
      [
        EmptyCell,
        <b>Total</b>,
        EmptyCell,
        regions.length > 1 && (
          <div className="border-left fr-text--bold">
            <div>
              {_.sum(
                prescriptionsByMatrix
                  .flatMap((p) => p.regionalData)
                  .map((p) => p.sampleCount)
              )}
            </div>
            {programmingPlan.status === 'Validated' && (
              <>
                <div>
                  {_.sum(
                    prescriptionsByMatrix
                      .flatMap((p) => p.regionalData)
                      .map((p) => p.sentSampleCount)
                  )}
                </div>
                <div>{matrixCompletionRate(prescriptionsByMatrix)}%</div>
              </>
            )}
          </div>
        ),
        ...regions.map((region) => [
          <div key={`total-${region}`} className="border-left fr-text--bold">
            <div>
              {_.sum(
                prescriptionsByMatrix.map(
                  (p) =>
                    p.regionalData.find((r) => r.region === region)?.sampleCount
                )
              )}
            </div>
            {programmingPlan.status === 'Validated' && (
              <>
                <div>
                  {_.sum(
                    prescriptionsByMatrix.map(
                      (p) =>
                        p.regionalData.find((r) => r.region === region)
                          ?.sentSampleCount
                    )
                  )}
                </div>
                <div>
                  {matrixCompletionRate(prescriptionsByMatrix, region)}%
                </div>
              </>
            )}
          </div>,
        ]),
        regions.length === 1 && EmptyCell,
      ].filter(isNotEmpty),
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!prescriptionsByMatrix) {
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
