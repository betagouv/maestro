import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import _ from 'lodash';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { genPrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { RegionList } from 'shared/schema/Region';
import { SampleStage } from 'shared/schema/Sample/SampleStage';
import AutoClose from 'src/components/AutoClose/AutoClose';
import EditableNumberCell from 'src/components/EditableNumberCell/EditableNumberCell';
import RegionHeaderCell from 'src/components/RegionHeaderCell/RegionHeaderCell';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import {
  useFindPrescriptionsQuery,
  useUpdatePrescriptionMutation,
} from 'src/services/prescription.service';

const PrescriptionView = () => {
  useDocumentTitle('Prescription');

  const { programmingPlanId } = useParams<{ programmingPlanId: string }>();

  const { data: prescriptions } = useFindPrescriptionsQuery(
    { programmingPlanId: programmingPlanId as string },
    {
      skip: !programmingPlanId,
    }
  );
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();

  const prescriptionsByMatrix = useMemo(() => {
    return genPrescriptionByMatrix(prescriptions);
  }, [prescriptions]);

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

  const EmptyCell = '';

  return (
    <section className={clsx(cx('fr-py-6w'), 'full-width')}>
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
      <h1 className={cx('fr-container')}>Prescription</h1>
      <Table
        bordered
        noCaption
        headers={[
          <Button
            title="Ajouter"
            iconId="fr-icon-add-circle-line"
            priority="tertiary no outline"
            className={cx('fr-pl-1w', 'fr-pr-0')}
          />,
          <div className="fr-pl-0">Matrice</div>,
          'Stade de prélèvement',
          'Total national',
          ...RegionList.map((region) => (
            <RegionHeaderCell region={region} key={region} />
          )),
        ]}
        data={[
          ...prescriptionsByMatrix.map((p) => [
            <Button
              title="Supprimer"
              iconId="fr-icon-delete-line"
              priority="tertiary no outline"
              size="small"
              className={cx('fr-pl-1w', 'fr-pr-0')}
            />,
            <div className="fr-pl-0">
              <b>{p.sampleMatrix}</b>
            </div>,
            <b>{p.sampleStage}</b>,
            <b>
              {p.regionSampleCounts.reduce((acc, count) => acc + count, 0)}
            </b>,
            ...p.regionSampleCounts.map((count, regionIndex) => (
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
            )),
          ]),
          [
            EmptyCell,
            <b>Total</b>,
            EmptyCell,
            <b>
              {_.sum(
                prescriptionsByMatrix.flatMap((p) => p.regionSampleCounts)
              )}
            </b>,
            ...RegionList.map((region, regionIndex) => (
              <b>
                {_.sum(
                  prescriptionsByMatrix.map(
                    (p) => p.regionSampleCounts[regionIndex]
                  )
                )}
              </b>
            )),
          ],
        ]}
      />
    </section>
  );
};

export default PrescriptionView;
