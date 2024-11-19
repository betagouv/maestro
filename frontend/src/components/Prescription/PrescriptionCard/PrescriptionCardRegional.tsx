import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useAuthentication } from 'src/hooks/useAuthentication';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionCardRegional = ({ programmingPlan, prescription }: Props) => {
  const { hasPermission } = useAuthentication();

  // TOOD
  // const { regionalPrescription, comments } = useMemo(() => {
  //   const regionalPrescription = prescription.regionalPrescriptions[0];
  //   return {
  //     regionalPrescription,
  //     comments: regionalPrescription?.comments ?? [],
  //   };
  // }, [prescription.regionalPrescriptions]);

  return (
    <div className={cx('fr-col-12', 'fr-col-md-4')}>
      <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
        <div className={cx('fr-card__body')}>
          <div className={cx('fr-card__content')}>
            {/*<PrescriptionCardContent*/}
            {/*  programmingPlan={programmingPlan}*/}
            {/*  prescription={prescription}*/}
            {/*  subtitle={*/}
            {/*    <Badge*/}
            {/*      noIcon*/}
            {/*      className={cx('fr-badge--yellow-tournesol', 'fr-my-1w')}*/}
            {/*    >*/}
            {/*      {regionalPrescription.sampleCount} */}
            {/*      {pluralize(regionalPrescription.sampleCount)(*/}
            {/*        'prélèvement programmé'*/}
            {/*      )}*/}
            {/*    </Badge>*/}
            {/*  }*/}
            {/*/>*/}
            {/*{programmingPlan.status === 'Submitted' &&*/}
            {/*  hasPermission('commentPrescription') && (*/}
            {/*    <div className="fr-card__end">*/}
            {/*      <div className="d-flex-align-center">*/}
            {/*        <PrescriptionCommentsModal*/}
            {/*          programmingPlanId={programmingPlan.id}*/}
            {/*          prescriptionId={regionalPrescription.prescriptionId}*/}
            {/*          comments={regionalPrescription.comments}*/}
            {/*          modalButton={*/}
            {/*            <Button*/}
            {/*              priority="tertiary"*/}
            {/*              size="small"*/}
            {/*              iconId={'fr-icon-question-answer-line'}*/}
            {/*            >*/}
            {/*              {comments.length > 0*/}
            {/*                ? `${comments.length} ${pluralize(comments.length)(*/}
            {/*                    'commentaire'*/}
            {/*                  )}`*/}
            {/*                : 'Échanger avec le coordinateur national'}*/}
            {/*            </Button>*/}
            {/*          }*/}
            {/*        />*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  )}*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCardRegional;
