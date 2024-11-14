import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useMemo } from 'react';
import { PrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionCardContent from 'src/components/Prescription/PrescriptionCard/PrescriptionCardContent';
import PrescriptionCommentsModal from 'src/components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptionByMatrix: PrescriptionByMatrix;
}

const PrescriptionCardRegional = ({
  programmingPlan,
  prescriptionByMatrix,
}: Props) => {
  const { hasPermission } = useAuthentication();

  const { regionalPrescription, comments } = useMemo(() => {
    const regionalPrescription = prescriptionByMatrix.regionalPrescriptions[0];
    return {
      regionalPrescription,
      comments: regionalPrescription?.comments ?? [],
    };
  }, [prescriptionByMatrix.regionalPrescriptions]);

  return (
    <div className={cx('fr-col-12', 'fr-col-md-4')}>
      <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
        <div className={cx('fr-card__body')}>
          <div className={cx('fr-card__content')}>
            <PrescriptionCardContent
              prescriptionByMatrix={prescriptionByMatrix}
              subtitle={
                <Badge
                  noIcon
                  className={cx('fr-badge--yellow-tournesol', 'fr-my-1w')}
                >
                  {regionalPrescription.sampleCount} 
                  {pluralize(regionalPrescription.sampleCount)(
                    'prélèvement programmé'
                  )}
                </Badge>
              }
            />
            {programmingPlan.status === 'Submitted' &&
              hasPermission('commentPrescription') && (
                <div className="fr-card__end">
                  <div className="d-flex-align-center">
                    <PrescriptionCommentsModal
                      programmingPlanId={programmingPlan.id}
                      prescriptionId={regionalPrescription.prescriptionId}
                      comments={regionalPrescription.comments}
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
