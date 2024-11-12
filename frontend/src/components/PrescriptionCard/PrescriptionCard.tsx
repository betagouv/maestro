import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useMemo } from 'react';
import { RegionList } from 'shared/referential/Region';
import { PrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { userRegions } from 'shared/schema/User/User';
import PrescriptionCardContent from 'src/components/PrescriptionCard/PrescriptionCardContent';
import PrescriptionCardPartialTable from 'src/components/PrescriptionCard/PrescriptionCardPartialTable';
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
  const { hasPermission, userInfos } = useAuthentication();

  const totalCount = useMemo(
    () =>
      prescriptionByMatrix.regionalData.reduce((acc, regionalData) => {
        return acc + regionalData.sampleCount;
      }, 0),
    [prescriptionByMatrix.regionalData]
  );

  return (
    <>
      {userRegions(userInfos).length > 1 ? (
        <div
          className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}
        >
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
                      {totalCount} 
                      {pluralize(totalCount)('prélèvement programmé')}
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
                    onChangePrescriptionCount={onChangePrescriptionCount}
                    start={0}
                    end={RegionList.length / 2}
                  />
                  <PrescriptionCardPartialTable
                    programmingPlan={programmingPlan}
                    prescriptionByMatrix={prescriptionByMatrix}
                    onChangePrescriptionCount={onChangePrescriptionCount}
                    start={RegionList.length / 2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={cx('fr-col-12', 'fr-col-md-4')}>
          <div
            className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}
          >
            <div className={cx('fr-card__body')}>
              <div className={cx('fr-card__content')}>
                <PrescriptionCardContent
                  prescriptionByMatrix={prescriptionByMatrix}
                  subtitle={
                    <Badge
                      noIcon
                      className={cx('fr-badge--yellow-tournesol', 'fr-my-1w')}
                    >
                      {totalCount} 
                      {pluralize(totalCount)('prélèvement programmé')}
                    </Badge>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionCard;
