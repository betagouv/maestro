import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  Prescription,
  PrescriptionUpdate,
} from 'shared/schema/Prescription/Prescription';
import {
  completionRate,
  genPrescriptionByMatrix,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { Region, RegionList } from 'shared/schema/Region';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { SampleStage } from 'shared/schema/Sample/SampleStage';
import { userRegions } from 'shared/schema/User/User';
import { isNotEmpty } from 'shared/utils/utils';
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
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  samples: PartialSample[];
}

const PrescriptionTable = ({
  programmingPlan,
  prescriptions,
  samples,
}: Props) => {
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
    return genPrescriptionByMatrix(
      prescriptions,
      samples,
      userRegions(userInfos)
    );
  }, [prescriptions, userInfos]); // eslint-disable-line react-hooks/exhaustive-deps

  const EmptyCell = <div></div>;

  const addMatrix = async (matrix: string, stage: SampleStage) => {
    await addPrescriptions({
      programmingPlanId: programmingPlan.id,
      prescriptions: RegionList.map((region) => ({
        sampleMatrix: matrix,
        sampleStage: stage,
        region,
        sampleCount: 0,
      })),
    });
  };

  const removeMatrix = async (matrix: string, stage: SampleStage) => {
    await deletePrescription({
      programmingPlanId: programmingPlan.id,
      prescriptionIds: (prescriptions ?? [])
        .filter((p) => p.sampleMatrix === matrix && p.sampleStage === stage)
        .map((p) => p.id),
    });
  };

  const headers = useMemo(
    () =>
      [
        <div>
          {hasPermission('createPrescription') &&
            programmingPlan.status === 'InProgress' && (
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
        hasNationalView && <div className="border-left">Total</div>,
        ...userRegions(userInfos).map((region) => (
          <div className="border-left" key={`header-${region}`}>
            <RegionHeaderCell region={region} />
          </div>
        )),
        !hasNationalView && 'Laboratoire',
      ].filter(isNotEmpty),
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const prescriptionsData = useMemo(
    () =>
      prescriptionsByMatrix.map((p) =>
        [
          <div key={`remove-${p.sampleMatrix}-${p.sampleStage}`}>
            {hasPermission('deletePrescription') &&
              programmingPlan.status === 'InProgress' && (
                <RemoveMatrix
                  matrix={p.sampleMatrix}
                  stage={p.sampleStage}
                  onRemoveMatrix={removeMatrix}
                />
              )}
          </div>,
          <div
            className={cx('fr-pl-0', 'fr-text--bold')}
            data-testid={`sampleMatrix-${p.sampleMatrix}`}
            key={`sampleMatrix-${p.sampleMatrix}-${p.sampleStage}`}
          >
            {p.sampleMatrix}
          </div>,
          <div
            className={cx('fr-pl-0', 'fr-text--bold')}
            key={`sampleStage-${p.sampleMatrix}-${p.sampleStage}`}
          >
            {p.sampleStage}
          </div>,
          hasNationalView && (
            <div
              className="border-left fr-text--bold"
              key={`total-${p.sampleMatrix}-${p.sampleStage}`}
            >
              <div>
                {_.sumBy(p.regionalData, ({ sampleCount }) => sampleCount)}
              </div>
              {programmingPlan.status === 'Validated' && [
                <div>
                  {_.sumBy(
                    p.regionalData,
                    ({ sentSampleCount }) => sentSampleCount
                  )}
                </div>,
                <div>{completionRate(p)}%</div>,
              ]}
            </div>
          ),
          ...p.regionalData.map(({ sampleCount, sentSampleCount, region }) => (
            <div
              className="border-left"
              data-testid={`cell-${p.sampleMatrix}`}
              key={`cell-${p.sampleMatrix}-${p.sampleStage}-${region}`}
            >
              {hasPermission('updatePrescriptionSampleCount') &&
              programmingPlan.status === 'InProgress' ? (
                <EditableNumberCell
                  initialValue={sampleCount}
                  onChange={(value) =>
                    changePrescription(p.sampleMatrix, p.sampleStage, region, {
                      sampleCount: value,
                    })
                  }
                />
              ) : (
                [
                  <div>{sampleCount}</div>,
                  programmingPlan.status === 'Validated' && [
                    <div>{sentSampleCount}</div>,
                    <div>{completionRate(p, region)}%</div>,
                  ],
                ]
              )}
            </div>
          )),
          !hasNationalView && (
            <div key={`laboratory-${p.sampleMatrix}-${p.sampleStage}`}>
              {programmingPlan.status === 'InProgress' ? (
                <EditableSelectCell
                  options={laboratoriesOptions(laboratories)}
                  initialValue={
                    p.regionalData.find((r) => r.region === userInfos?.region)
                      ?.laboratoryId ?? ''
                  }
                  onChange={(value) =>
                    changePrescription(
                      p.sampleMatrix,
                      p.sampleStage,
                      userInfos?.region as Region,
                      {
                        laboratoryId: value,
                      }
                    )
                  }
                />
              ) : (
                <div>
                  {
                    laboratories?.find(
                      (l) =>
                        l.id ===
                        p.regionalData.find(
                          (r) => r.region === userInfos?.region
                        )?.laboratoryId
                    )?.name
                  }
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
        hasNationalView && (
          <div className="border-left fr-text--bold">
            <div>
              {_.sum(
                prescriptionsByMatrix
                  .flatMap((p) => p.regionalData)
                  .map((p) => p.sampleCount)
              )}
            </div>
            {programmingPlan.status === 'Validated' && [
              <div>
                {_.sum(
                  prescriptionsByMatrix
                    .flatMap((p) => p.regionalData)
                    .map((p) => p.sentSampleCount)
                )}
              </div>,
              <div>{completionRate(prescriptionsByMatrix)}%</div>,
            ]}
          </div>
        ),
        ...userRegions(userInfos).map((region) => [
          <div key={`total-${region}`} className="border-left fr-text--bold">
            <div>
              {_.sum(
                prescriptionsByMatrix.map(
                  (p) =>
                    p.regionalData.find((r) => r.region === region)?.sampleCount
                )
              )}
            </div>
            {programmingPlan.status === 'Validated' && [
              <div>
                {_.sum(
                  prescriptionsByMatrix.map(
                    (p) =>
                      p.regionalData.find((r) => r.region === region)
                        ?.sentSampleCount
                  )
                )}
              </div>,
              <div>{completionRate(prescriptionsByMatrix, region)}%</div>,
            ]}
          </div>,
        ]),
        !hasNationalView && EmptyCell,
      ].filter(isNotEmpty),
    [prescriptionsByMatrix] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!prescriptions) {
    return <></>;
  }

  const changePrescription = async (
    matrix: string,
    stage: SampleStage,
    region: Region,
    prescriptionUpdate: PrescriptionUpdate
  ) => {
    const prescriptionId = prescriptions.find(
      (p) =>
        p.sampleMatrix === matrix &&
        p.sampleStage === stage &&
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
          window.open(getPrescriptionsExportURL(programmingPlan.id))
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
