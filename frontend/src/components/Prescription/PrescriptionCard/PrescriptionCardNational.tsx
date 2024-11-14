import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useMemo } from 'react';
import { RegionList } from 'shared/referential/Region';
import { PrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionCardContent from 'src/components/Prescription/PrescriptionCard/PrescriptionCardContent';
import PrescriptionCardPartialTable from 'src/components/Prescription/PrescriptionCard/PrescriptionCardPartialTable';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import RemoveMatrix from 'src/views/PrescriptionListView/RemoveMatrix';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptionByMatrix: PrescriptionByMatrix;
  onChangePrescription: (
    prescriptionId: string,
    value: number
    // update: Pick<Prescription, 'sampleCount'>
  ) => void;
  onRemovePrescriptionByMatrix: (
    prescriptionByMatrix: PrescriptionByMatrix
  ) => Promise<void>;
}

const PrescriptionCardNational = ({
  programmingPlan,
  prescriptionByMatrix,
  onChangePrescription,
  onRemovePrescriptionByMatrix: removeMatrix,
}: Props) => {
  const { hasPermission } = useAuthentication();

  const totalCount = useMemo(
    () =>
      prescriptionByMatrix.regionalPrescriptions.reduce(
        (acc, regionalPrescriptions) => {
          return acc + regionalPrescriptions.sampleCount;
        },
        0
      ),
    [prescriptionByMatrix.regionalPrescriptions]
  );

  return (
    <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
      <div className={cx('fr-card__body')}>
        <div className={cx('fr-card__content')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-col-md-5')}>
              <PrescriptionCardContent
                prescriptionByMatrix={prescriptionByMatrix}
              />
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
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                prescriptionByMatrix={prescriptionByMatrix}
                onChangePrescriptionCount={onChangePrescription}
                start={0}
                end={RegionList.length / 2}
              />
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                prescriptionByMatrix={prescriptionByMatrix}
                onChangePrescriptionCount={onChangePrescription}
                start={RegionList.length / 2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCardNational;
