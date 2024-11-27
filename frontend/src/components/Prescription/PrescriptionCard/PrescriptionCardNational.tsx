import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import _ from 'lodash';
import { Region, RegionList } from 'shared/referential/Region';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'shared/schema/RegionalPrescription/RegionalPrescription';
import PrescriptionCardContent from 'src/components/Prescription/PrescriptionCard/PrescriptionCardContent';
import PrescriptionCardPartialTable from 'src/components/Prescription/PrescriptionCard/PrescriptionCardPartialTable';
import { useAuthentication } from 'src/hooks/useAuthentication';
import RemoveMatrix from 'src/views/PrescriptionListView/RemoveMatrix';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalPrescriptionCount: (
    prescriptionId: string,
    region: Region,
    value: number
  ) => void;
  onRemovePrescription: (prescriptionId: string) => Promise<void>;
}

const PrescriptionCardNational = ({
  programmingPlan,
  prescription,
  regionalPrescriptions,
  onChangeRegionalPrescriptionCount,
  onRemovePrescription: removeMatrix
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();

  return (
    <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
      <div className={cx('fr-card__body')}>
        <div className={cx('fr-card__content')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-col-md-5')}>
              <PrescriptionCardContent
                programmingPlan={programmingPlan}
                prescription={prescription}
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-md-7')}>
              <div className={clsx(cx('fr-mb-3w'), 'd-flex-align-center')}>
                <span className="flex-grow-1">
                  {t('plannedSample', {
                    count: _.sumBy(regionalPrescriptions, 'sampleCount')
                  })}
                </span>
                {hasUserPrescriptionPermission(programmingPlan)?.delete && (
                  <RemoveMatrix
                    matrix={prescription.matrix}
                    stages={prescription.stages}
                    onRemove={() => removeMatrix(prescription.id)}
                  />
                )}
              </div>
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalPrescriptionCount={
                  onChangeRegionalPrescriptionCount
                }
                start={0}
                end={RegionList.length / 2}
              />
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalPrescriptionCount={
                  onChangeRegionalPrescriptionCount
                }
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
