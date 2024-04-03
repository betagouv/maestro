import Alert from '@codegouvfr/react-dsfr/Alert';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { genPrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { Region, RegionList } from 'shared/schema/Region';
import { SampleStage } from 'shared/schema/Sample/SampleStage';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import AutoClose from 'src/components/AutoClose/AutoClose';
import EditableNumberCell from 'src/components/EditableNumberCell/EditableNumberCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { useAuthentication } from 'src/hooks/useAuthentication';
import {
  useAddPrescriptionsMutation,
  useDeletePrescriptionsMutation,
  useUpdatePrescriptionMutation,
} from 'src/services/prescription.service';
import AddMatrix from 'src/views/PrescriptionView/AddMatrix';
import RemoveMatrix from 'src/views/PrescriptionView/RemoveMatrix';

interface Props {
  programmingPlanId: string;
  prescriptions: Prescription[];
}

const PrescriptionTable = ({ programmingPlanId, prescriptions }: Props) => {
  const { hasPermission, hasNationalView, userInfos } = useAuthentication();

  const [addPrescriptions, { isSuccess: isAddSuccess }] =
    useAddPrescriptionsMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    useDeletePrescriptionsMutation();

  const prescriptionsByMatrix = useMemo(() => {
    if (!prescriptions || !userInfos) return [];
    return genPrescriptionByMatrix(
      prescriptions,
      hasNationalView ? RegionList : [userInfos.region as Region]
    );
  }, [prescriptions, userInfos]); // eslint-disable-line react-hooks/exhaustive-deps

  const EmptyCell = <div></div>;

  const addMatrix = async (matrix: string, stage: SampleStage) => {
    if (programmingPlanId) {
      await addPrescriptions({
        programmingPlanId,
        prescriptions: RegionList.map((region) => ({
          sampleMatrix: matrix,
          sampleStage: stage,
          region,
          sampleCount: 0,
        })),
      });
    }
  };

  const removeMatrix = async (matrix: string, stage: SampleStage) => {
    if (programmingPlanId) {
      await deletePrescription({
        programmingPlanId,
        prescriptionIds: (prescriptions ?? [])
          .filter((p) => p.sampleMatrix === matrix && p.sampleStage === stage)
          .map((p) => p.id),
      });
    }
  };

  const headers = useMemo(
    () => [
      <div>
        {hasPermission('createPrescription') && (
          <AddMatrix
            excludedList={prescriptionsByMatrix.map((p) => ({
              matrix: p.sampleMatrix,
              stage: p.sampleStage,
            }))}
            onAddMatrix={addMatrix}
          />
        )}
      </div>,
      <div className="fr-pl-0">Matrice</div>,
      'Stade de prélèvement',
      hasNationalView ? 'Total national' : undefined,
      ...(hasNationalView ? RegionList : [userInfos?.region])
        .filter(isDefinedAndNotNull)
        .map((region) => <RegionHeaderCell region={region} key={region} />),
    ],
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const prescriptionsData = useMemo(
    () =>
      prescriptionsByMatrix.map((p) => [
        <div>
          {hasPermission('deletePrescription') && (
            <RemoveMatrix
              matrix={p.sampleMatrix}
              stage={p.sampleStage}
              onRemoveMatrix={removeMatrix}
              key={`remove-${p.sampleMatrix}-${p.sampleStage}`}
            />
          )}
        </div>,
        <div className="fr-pl-0" data-testid={`sampleMatrix-${p.sampleMatrix}`}>
          <b>{p.sampleMatrix}</b>
        </div>,
        <b>{p.sampleStage}</b>,
        hasNationalView ? (
          <b>{p.regionSampleCounts.reduce((acc, count) => acc + count, 0)}</b>
        ) : undefined,
        ...p.regionSampleCounts.map((count, regionIndex) => (
          <div
            data-testid={`cell-${p.sampleMatrix}`}
            key={`cell-${p.sampleMatrix}-${p.sampleStage}-${regionIndex}`}
          >
            {hasPermission('updatePrescription') ? (
              <EditableNumberCell
                initialValue={count}
                onChange={(value) =>
                  changePrescriptionCount(
                    p.sampleMatrix,
                    p.sampleStage,
                    regionIndex,
                    value
                  )
                }
              />
            ) : (
              count
            )}
          </div>
        )),
      ]),
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalData = useMemo(
    () => [
      EmptyCell,
      <b>Total</b>,
      EmptyCell,
      hasNationalView ? (
        <b>
          {_.sum(prescriptionsByMatrix.flatMap((p) => p.regionSampleCounts))}
        </b>
      ) : undefined,
      ...(hasNationalView ? RegionList : [userInfos?.region]).map(
        (region, regionIndex) => (
          <div key={`total-${region}`}>
            <b>
              {_.sum(
                prescriptionsByMatrix.map(
                  (p) => p.regionSampleCounts[regionIndex]
                )
              )}
            </b>
          </div>
        )
      ),
    ],
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!programmingPlanId || !prescriptions) {
    return <></>;
  }

  const changePrescriptionCount = async (
    matrix: string,
    stage: SampleStage,
    regionIndex: number,
    sampleCount: number
  ) => {
    const prescriptionId = prescriptions.find(
      (p) =>
        p.sampleMatrix === matrix &&
        p.sampleStage === stage &&
        p.region === RegionList[regionIndex]
    )?.id;

    if (prescriptionId) {
      await updatePrescription({
        programmingPlanId,
        prescriptionId,
        prescriptionUpdate: { sampleCount },
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
      <Table
        bordered
        noCaption
        headers={headers}
        data={[...prescriptionsData, totalData]}
        className={clsx({ 'full-width': hasNationalView })}
      />
    </div>
  );
};

export default PrescriptionTable;
