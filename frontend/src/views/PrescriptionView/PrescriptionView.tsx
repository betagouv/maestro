import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
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

  const [expanded, setExpanded] = useState(false);

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

  return (
    <section className={clsx(cx('fr-py-6w'), { 'full-width': expanded })}>
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
      <h1 className={cx({ 'fr-container': expanded })}>
        Prescription
        <div className="float-right">
          <Button
            iconId="ri-fullscreen-exit-fill"
            title="réduire"
            priority={expanded ? 'tertiary' : 'primary'}
            onClick={() => setExpanded(false)}
            disabled={!expanded}
            className={cx('fr-ml-3w')}
          />
          <Button
            iconId="ri-fullscreen-fill"
            title="agrandir"
            priority={expanded ? 'primary' : 'tertiary'}
            onClick={() => setExpanded(true)}
            disabled={expanded}
          />
        </div>
      </h1>
      <Table
        bordered
        noCaption
        headers={[
          'Matrice',
          'Stade de prélèvement',
          ...RegionList.map((region) => (
            <RegionHeaderCell region={region} key={region} />
          )),
        ]}
        data={prescriptionsByMatrix.map((p) => [
          p.sampleMatrix,
          p.sampleStage,
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
        ])}
      />
    </section>
  );
};

export default PrescriptionView;
