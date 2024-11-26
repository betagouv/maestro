import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import { useMemo } from 'react';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'shared/schema/RegionalPrescription/RegionalPrescription';
import PrescriptionCardContent from 'src/components/Prescription/PrescriptionCard/PrescriptionCardContent';
import RegionalPrescriptionCommentsModal from 'src/components/Prescription/RegionalPrescriptionCommentsModal/RegionalPrescriptionCommentsModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription?: RegionalPrescription;
}

const PrescriptionCardRegional = ({
  programmingPlan,
  prescription,
  regionalPrescription,
}: Props) => {
  const { hasPermission } = useAuthentication();

  const comments = useMemo(() => {
    return regionalPrescription?.comments || [];
  }, [regionalPrescription?.comments]);

  if (!regionalPrescription) {
    return <></>;
  }

  return (
    <div className={cx('fr-col-12', 'fr-col-md-4')}>
      <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
        <div className={cx('fr-card__body')}>
          <div className={cx('fr-card__content')}>
            <PrescriptionCardContent
              programmingPlan={programmingPlan}
              prescription={prescription}
              subtitle={
                <Badge
                  noIcon
                  className={cx('fr-badge--yellow-tournesol', 'fr-my-1w')}
                >
                  {t('plannedSample', {
                    count: regionalPrescription.sampleCount,
                  })}
                </Badge>
              }
            />
            {programmingPlan.status === 'Submitted' &&
              hasPermission('commentPrescription') && (
                <div className="fr-card__end">
                  <div className="d-flex-align-center">
                    <RegionalPrescriptionCommentsModal
                      programmingPlanId={programmingPlan.id}
                      regionalPrescription={regionalPrescription}
                      modalButton={
                        <Button
                          priority="tertiary"
                          size="small"
                          iconId={'fr-icon-question-answer-line'}
                        >
                          {comments.length > 0
                            ? `${comments.length} ${pluralize(comments.length)(
                                'commentaire'
                              )}`
                            : 'Échanger avec le coordinateur national'}
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCardRegional;
