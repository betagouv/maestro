import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  Prescription,
  PrescriptionUpdate,
} from 'shared/schema/Prescription/Prescription';
import { genPrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { RegionList } from 'shared/schema/Region';
import { SampleStage } from 'shared/schema/Sample/SampleStage';
import { userRegions } from 'shared/schema/User/User';
import AutoClose from 'src/components/AutoClose/AutoClose';
import EditableNumberCell from 'src/components/EditableCell/EditableNumberCell';
import EditableSelectCell from 'src/components/EditableCell/EditableSelectCell';
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
  const { data: laboratories } = useFindLaboratoriesQuery();

  const prescriptionsByMatrix = useMemo(() => {
    if (!prescriptions || !userInfos) return [];
    return genPrescriptionByMatrix(prescriptions, userRegions(userInfos));
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
      ...userRegions(userInfos).map((region) => (
        <RegionHeaderCell region={region} key={region} />
      )),
      hasNationalView ? undefined : 'Laboratoire',
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
          <b>{_.sumBy(p.regionalData, ({ sampleCount }) => sampleCount)}</b>
        ) : undefined,
        ...p.regionalData.map(({ sampleCount }, regionIndex) => (
          <div
            data-testid={`cell-${p.sampleMatrix}`}
            key={`cell-${p.sampleMatrix}-${p.sampleStage}-${regionIndex}`}
          >
            {hasPermission('updatePrescriptionSampleCount') ? (
              <EditableNumberCell
                initialValue={sampleCount}
                onChange={(value) =>
                  changePrescription(
                    p.sampleMatrix,
                    p.sampleStage,
                    regionIndex,
                    { sampleCount: value }
                  )
                }
              />
            ) : (
              sampleCount
            )}
          </div>
        )),
        hasNationalView ? undefined : (
          <EditableSelectCell
            options={laboratoriesOptions(laboratories)}
            initialValue={p.regionalData[0].laboratoryId ?? ''}
            onChange={(value) =>
              changePrescription(p.sampleMatrix, p.sampleStage, 0, {
                laboratoryId: value,
              })
            }
          />
        ),
      ]),
    [prescriptionsByMatrix, laboratories] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalData = useMemo(
    () => [
      EmptyCell,
      <b>Total</b>,
      EmptyCell,
      hasNationalView ? (
        <b>
          {_.sum(
            prescriptionsByMatrix
              .flatMap((p) => p.regionalData)
              .map((p) => p.sampleCount)
          )}
        </b>
      ) : undefined,
      ...userRegions(userInfos).map((region, regionIndex) => (
        <div key={`total-${region}`}>
          <b>
            {_.sum(
              prescriptionsByMatrix.map(
                (p) => p.regionalData[regionIndex].sampleCount
              )
            )}
          </b>
        </div>
      )),
      hasNationalView ? undefined : '',
    ],
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!programmingPlanId || !prescriptions) {
    return <></>;
  }

  const changePrescription = async (
    matrix: string,
    stage: SampleStage,
    regionIndex: number,
    prescriptionUpdate: PrescriptionUpdate
  ) => {
    const prescriptionId = prescriptions.find(
      (p) =>
        p.sampleMatrix === matrix &&
        p.sampleStage === stage &&
        p.region === userRegions(userInfos)[regionIndex]
    )?.id;

    if (prescriptionId) {
      await updatePrescription({
        programmingPlanId,
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
          window.open(getPrescriptionsExportURL(programmingPlanId))
        }
      >
        Télécharger
      </Button>
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
