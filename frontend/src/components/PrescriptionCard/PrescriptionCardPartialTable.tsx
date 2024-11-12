import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { RegionList, Regions } from 'shared/referential/Region';
import {
  matrixCompletionRate,
  PrescriptionByMatrix,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionCountCell from 'src/components/PrescriptionCountCell/PrescriptionCountCell';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptionByMatrix: PrescriptionByMatrix;
  onChangePrescriptionCount: (prescriptionId: string, value: number) => void;
  start: number;
  end?: number;
}

const PrescriptionCardPartialTable = ({
  programmingPlan,
  prescriptionByMatrix,
  onChangePrescriptionCount,
  start,
  end,
}: Props) => {
  return (
    <Table
      bordered={false}
      noCaption
      noScroll
      fixed
      headers={RegionList.slice(0, RegionList.length / 2).map((region) => (
        <div
          key={`prescription_${prescriptionByMatrix.matrix}_header_${region}`}
        >
          {Regions[region].shortName}
        </div>
      ))}
      data={[
        prescriptionByMatrix.regionalData
          .slice(start, end)
          .map((regionalData) => (
            <PrescriptionCountCell
              prescriptionId={regionalData.prescriptionId}
              programmingPlan={programmingPlan}
              sampleCount={regionalData.sampleCount}
              sentSampleCount={regionalData.sentSampleCount}
              completionRate={matrixCompletionRate(
                prescriptionByMatrix,
                regionalData.region
              )}
              onChange={async (value) =>
                onChangePrescriptionCount(regionalData.prescriptionId, value)
              }
            />
          )),
      ]}
      className={cx('fr-mb-3w')}
    />
  );
};

export default PrescriptionCardPartialTable;
