import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { RegionList, Regions } from 'shared/referential/Region';
import { StageLabels } from 'shared/referential/Stage';
import {
  matrixCompletionRate,
  PrescriptionByMatrix,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionCountCell from 'src/components/PrescriptionCountCell/PrescriptionCountCell';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import RemoveMatrix from 'src/views/PrescriptionListView/RemoveMatrix';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptionByMatrix: PrescriptionByMatrix;
  onChangePrescriptionCount: (prescriptionId: string, value: number) => void;
  onRemovePrescriptionByMatrix: (
    prescriptionByMatrix: PrescriptionByMatrix
  ) => Promise<void>;
}

const PrescriptionCard = ({
  programmingPlan,
  prescriptionByMatrix,
  onChangePrescriptionCount,
  onRemovePrescriptionByMatrix: removeMatrix,
}: Props) => {
  const { hasPermission } = useAuthentication();

  const totalCount = useMemo(
    () =>
      prescriptionByMatrix.regionalData.reduce((acc, regionalData) => {
        return acc + regionalData.sampleCount;
      }, 0),
    [prescriptionByMatrix.regionalData]
  );

  const partialTable = (start: number, end?: number) => (
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

  return (
    <div className={clsx(cx('fr-card'), 'prescription-card')}>
      <div className={cx('fr-card__body')}>
        <div className={cx('fr-card__content')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-col-md-5')}>
              <h3 className={cx('fr-card__title')}>
                {MatrixLabels[prescriptionByMatrix.matrix]}
              </h3>
              <div className={cx('fr-text--xs', 'fr-card__desc')}>
                <div className={cx('fr-text--bold', 'fr-mb-0')}>
                  Stades de prélèvement
                </div>
                <ul>
                  {prescriptionByMatrix.stages.map((stage) => (
                    <li
                      key={`prescription_${prescriptionByMatrix.matrix}_stage_${stage}`}
                    >
                      {StageLabels[stage]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={cx('fr-col-12', 'fr-col-md-7')}>
              <div className={clsx(cx('fr-mb-3w'), 'd-flex-align-center')}>
                <span className="flex-grow-1">
                  {totalCount} {pluralize(totalCount)('prélèvement programmé')}
                </span>
                {hasPermission('deletePrescription') &&
                  programmingPlan.status === 'InProgress' && (
                    <RemoveMatrix
                      matrix={prescriptionByMatrix.matrix}
                      stages={prescriptionByMatrix.stages}
                      onRemove={() => removeMatrix(prescriptionByMatrix)}
                    />
                  )}
              </div>
              {partialTable(0, RegionList.length / 2)}
              {partialTable(RegionList.length / 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;
