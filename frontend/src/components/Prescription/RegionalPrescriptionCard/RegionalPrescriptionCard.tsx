import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'shared/schema/RegionalPrescription/RegionalPrescription';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import RegionalPrescriptionCommentsModalButton from 'src/components/Prescription/RegionalPrescriptionCommentsModal/RegionalPrescriptionCommentsModalButton';
import RegionalPrescriptionLaboratory from 'src/components/Prescription/RegionalPrescriptionLaboratory/RegionalPrescriptionLaboratory';
import { useAuthentication } from 'src/hooks/useAuthentication';
import '../PrescriptionCard/PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription?: RegionalPrescription;
  onChangeLaboratory: (laboratoryId: string) => Promise<void>;
}

const RegionalPrescriptionCard = ({
  programmingPlan,
  prescription,
  regionalPrescription,
  onChangeLaboratory
}: Props) => {
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();

  if (!regionalPrescription) {
    return <></>;
  }

  return (
    <div className={cx('fr-col-12', 'fr-col-md-4')}>
      <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
        <div className={cx('fr-card__body')}>
          <div className={cx('fr-card__content')}>
            <h3 className={cx('fr-card__title')}>
              {MatrixLabels[prescription.matrix]}
            </h3>
            <Badge
              noIcon
              className={cx('fr-badge--yellow-tournesol', 'fr-my-1w')}
            >
              {t('plannedSample', {
                count: regionalPrescription.sampleCount
              })}
            </Badge>
            <div className={cx('fr-card__desc')}>
              <PrescriptionStages
                programmingPlan={programmingPlan}
                prescription={prescription}
                label="Stades de prélèvement"
              />
            </div>
            {hasUserRegionalPrescriptionPermission(
              programmingPlan,
              regionalPrescription
            )?.comment && (
              <div className="fr-card__end">
                <RegionalPrescriptionCommentsModalButton
                  regionalPrescription={regionalPrescription}
                />
              </div>
            )}
            {hasUserRegionalPrescriptionPermission(
              programmingPlan,
              regionalPrescription
            )?.updateLaboratory && (
              <div className="fr-card__end">
                <RegionalPrescriptionLaboratory
                  regionalPrescription={regionalPrescription}
                  onChangeLaboratory={onChangeLaboratory}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalPrescriptionCard;
