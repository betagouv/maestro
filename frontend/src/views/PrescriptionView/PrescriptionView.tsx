import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { genPrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { Region, RegionList } from 'shared/schema/Region';
import { SampleStage } from 'shared/schema/Sample/SampleStage';
import { User } from 'shared/schema/User/User';
import AutoClose from 'src/components/AutoClose/AutoClose';
import EditableNumberCell from 'src/components/EditableNumberCell/EditableNumberCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import {
  useAddPrescriptionsMutation,
  useDeletePrescriptionsMutation,
  useFindPrescriptionsQuery,
  useUpdatePrescriptionMutation,
} from 'src/services/prescription.service';
import AddMatrix from 'src/views/PrescriptionView/AddMatrix';
import RemoveMatrix from 'src/views/PrescriptionView/RemoveMatrix';

const PrescriptionView = () => {
  useDocumentTitle('Prescription');

  const { programmingPlanId } = useParams<{ programmingPlanId: string }>();
  const { hasPermission, hasNationalView, userInfos } = useAuthentication();

  const { data: prescriptions } = useFindPrescriptionsQuery(
    { programmingPlanId: programmingPlanId as string },
    {
      skip: !programmingPlanId,
    }
  );
  const [addPrescriptions, { isSuccess: isAddSuccess }] =
    useAddPrescriptionsMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    useDeletePrescriptionsMutation();

  const prescriptionsByMatrix = useMemo(() => {
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
      ...(hasNationalView
        ? RegionList
        : [(userInfos as User).region as Region]
      ).map((region) => <RegionHeaderCell region={region} key={region} />),
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
        <div className="fr-pl-0">
          <b>{p.sampleMatrix}</b>
        </div>,
        <b>{p.sampleStage}</b>,
        hasNationalView ? (
          <b>{p.regionSampleCounts.reduce((acc, count) => acc + count, 0)}</b>
        ) : undefined,
        ...p.regionSampleCounts.map((count, regionIndex) => (
          <div
            key={`editable-${p.sampleMatrix}-${p.sampleStage}-${regionIndex}`}
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
      ...(hasNationalView ? RegionList : [userInfos.region]).map(
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
    <section
      className={clsx(cx('fr-py-6w'), { 'full-width': hasNationalView })}
    >
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
      <h1 className={cx('fr-container')}>Prescription</h1>
      <Table
        bordered
        noCaption
        headers={headers}
        data={[...prescriptionsData, totalData]}
        // fixed={!hasNationalView}
      />
    </section>
  );
};

export default PrescriptionView;
