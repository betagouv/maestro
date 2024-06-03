import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, RegionList } from 'shared/referential/Region';
import { Stage, StageLabels } from 'shared/referential/Stage';
import {
  Prescription,
  PrescriptionUpdate,
} from 'shared/schema/Prescription/Prescription';
import {
  genPrescriptionByMatrix,
  matrixCompletionRate,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { isNotEmpty } from 'shared/utils/utils';
import AutoClose from 'src/components/AutoClose/AutoClose';
import EditableNumberCell from 'src/components/EditableCell/EditableNumberCell';
import EditableSelectCell from 'src/components/EditableCell/EditableSelectCell';
import MatrixSelectModal from 'src/components/MatrixSelectModal/MatrixSelectModal';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { laboratoriesOptions } from 'src/components/_app/AppSelect/AppSelectOption';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useFindLaboratoriesQuery } from 'src/services/laboratory.service';
import {
  getPrescriptionsExportURL,
  useAddPrescriptionsMutation,
  useDeletePrescriptionsMutation,
  useUpdatePrescriptionMutation,
} from 'src/services/prescription.service';
import RemoveMatrix from 'src/views/PrescriptionView/RemoveMatrix';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  samples: PartialSample[];
  regions: Region[];
}

const PrescriptionTable = ({
  programmingPlan,
  prescriptions,
  samples,
  regions,
}: Props) => {
  const { hasPermission } = useAuthentication();

  const [addPrescriptions, { isSuccess: isAddSuccess }] =
    useAddPrescriptionsMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    useDeletePrescriptionsMutation();

  // @ts-ignore
  const { data: laboratories } = useFindLaboratoriesQuery(_, {
    skip: regions.length > 1,
  });

  const prescriptionsByMatrix = useMemo(() => {
    if (!prescriptions) return [];
    return genPrescriptionByMatrix(prescriptions, samples, regions);
  }, [prescriptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const EmptyCell = <div></div>;

  const addMatrix = async (matrix: Matrix, stages: Stage[]) => {
    await addPrescriptions({
      programmingPlanId: programmingPlan.id,
      prescriptions: RegionList.map((region) => ({
        matrix,
        stages,
        region,
        sampleCount: 0,
      })),
    });
  };

  const removeMatrix = async (matrix: string, stages: Stage[]) => {
    await deletePrescription({
      programmingPlanId: programmingPlan.id,
      prescriptionIds: (prescriptions ?? [])
        .filter((p) => p.matrix === matrix && _.isEqual(p.stages, stages))
        .map((p) => p.id),
    });
  };

  const headers = useMemo(
    () =>
      [
        <div className="cell-icon">
          {hasPermission('createPrescription') &&
            programmingPlan.status === 'InProgress' && (
              <MatrixSelectModal
                excludedList={prescriptionsByMatrix.map((p) => ({
                  matrix: p.matrix,
                  stages: p.stages,
                }))}
                onSelect={addMatrix}
              />
            )}
        </div>,
        <div>Matrice</div>,
        <div>Stade(s) de prélèvement</div>,
        regions.length > 1 && <div className="border-left">Total</div>,
        ...regions.map((region) => (
          <div className="border-left" key={`header-${region}`}>
            <RegionHeaderCell region={region} />
          </div>
        )),
        regions.length === 1 && 'Laboratoire',
      ].filter(isNotEmpty),
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
                  onRemoveMatrix={removeMatrix}
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
          <div
            className={cx('fr-pl-0', 'fr-text--bold')}
            key={`sampleStage-${p.matrix}-${p.stages}`}
          >
            {p.stages.map((stage) => (
              <div key={`sampleStage-${p.matrix}-${stage}`}>
                {StageLabels[stage]}
              </div>
            ))}
          </div>,
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
          ...p.regionalData.map(({ sampleCount, sentSampleCount, region }) => (
            <div
              className="border-left"
              data-testid={`cell-${p.matrix}`}
              key={`cell-${p.matrix}-${p.stages}-${region}`}
            >
              {hasPermission('updatePrescriptionSampleCount') &&
              programmingPlan.status === 'InProgress' ? (
                <EditableNumberCell
                  initialValue={sampleCount}
                  onChange={(value) =>
                    changePrescription(p.matrix, p.stages, region, {
                      sampleCount: value,
                    })
                  }
                />
              ) : (
                <>
                  <div>{sampleCount}</div>
                  {programmingPlan.status === 'Validated' && (
                    <>
                      <div>{sentSampleCount}</div>
                      <div>{matrixCompletionRate(p, region)}%</div>
                    </>
                  )}
                </>
              )}
            </div>
          )),
          regions.length === 1 && (
            <div key={`laboratory-${p.matrix}-${p.stages}`}>
              {programmingPlan.status === 'InProgress' &&
              hasPermission('updatePrescriptionLaboratory') ? (
                <EditableSelectCell
                  options={laboratoriesOptions(laboratories)}
                  initialValue={
                    p.regionalData.find((r) => r.region === regions[0])
                      ?.laboratoryId ?? ''
                  }
                  onChange={(value) =>
                    changePrescription(p.matrix, p.stages, regions[0], {
                      laboratoryId: value,
                    })
                  }
                />
              ) : (
                <div>
                  {laboratories?.find(
                    (l) =>
                      l.id ===
                      p.regionalData.find((r) => r.region === regions[0])
                        ?.laboratoryId
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

  if (!prescriptions) {
    return <></>;
  }

  const changePrescription = async (
    matrix: string,
    stages: Stage[],
    region: Region,
    prescriptionUpdate: PrescriptionUpdate
  ) => {
    const prescriptionId = prescriptions.find(
      (p) =>
        p.matrix === matrix &&
        _.isEqual(p.stages, stages) &&
        p.region === region
    )?.id;

    if (prescriptionId) {
      await updatePrescription({
        programmingPlanId: programmingPlan.id,
        prescriptionId,
        prescriptionUpdate,
      });
    }
  };

  return (
    <div data-testid="prescription-table">
      {isUpdateSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small={true}
              description="Modification enregistrée"
              closable
            />
          </div>
        </AutoClose>
      )}
      {isAddSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small={true}
              description="Matrice ajoutée"
              closable
            />
          </div>
        </AutoClose>
      )}
      {isDeleteSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small={true}
              description="Matrice supprimée"
              closable
            />
          </div>
        </AutoClose>
      )}
      <Button
        priority="tertiary no outline"
        iconId="fr-icon-download-line"
        onClick={() =>
          window.open(
            getPrescriptionsExportURL({
              programmingPlanId: programmingPlan.id,
              region: regions.length > 1 ? undefined : regions[0],
            })
          )
        }
      >
        Télécharger
      </Button>
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
