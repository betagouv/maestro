import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Region } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext } from 'react';
import alert from '../../../assets/illustrations/alert.svg';
import check from '../../../assets/illustrations/check.svg';
import dialog from '../../../assets/illustrations/dialog.svg';
import distribution from '../../../assets/illustrations/distribution.svg';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import '../ProgrammingPlanNotification.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  region: Region;
}

const ProgrammingPlanNotificationRegionalToNational = ({
  programmingPlan,
  region
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { hasNationalView } = useAuthentication();

  const regionalValidationModal = createModal({
    id: `regional-validation-modal`,
    isOpenedByDefault: false
  });

  const [updateRegionalStatus] =
    apiClient.useUpdateProgrammingPlanRegionalStatusMutation();

  const submit = async () => {
    await updateRegionalStatus({
      programmingPlanId: programmingPlan.id,
      programmingPlanRegionalStatusList: [
        {
          region,
          status: 'Approved'
        }
      ]
    });
  };

  const status = programmingPlan.regionalStatus.find(
    (status) => status.region === region
  )?.status;

  if (
    hasNationalView ||
    (status && !['Submitted', 'Approved'].includes(status))
  ) {
    return <></>;
  }

  return status === 'Submitted' ? (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-1w')}>
      {programmingPlan.distributionKind === 'REGIONAL' && (
        <>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <div
              className={clsx('white-container', 'step-container', 'fr-p-3w')}
            >
              <div className="step-number">
                <span className={cx('fr-px-2w')}>01</span>

                <img src={dialog} width="100%" aria-hidden alt="" />
              </div>
              <div className="step-content">
                <h4 className={cx('fr-mb-1w')}>
                  Consultez les objectifs de prélèvements par matrice
                </h4>
                <div className={cx('fr-text--regular', 'fr-mb-4w')}>
                  La programmation {programmingPlan.year} vous est désormais
                  partagée. Ajoutez si besoin vos commentaires afin de les
                  remonter à la coordination nationale.
                </div>
              </div>
            </div>
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <div
              className={clsx('white-container', 'step-container', 'fr-p-3w')}
            >
              <div className="step-number">
                <span className={cx('fr-px-2w')}>02</span>
                <img src={check} width="100%" aria-hidden alt="" />
              </div>
              <div className="step-content">
                <h4 className={cx('fr-mb-1w')}>
                  Notifiez que vous avez bien pris connaissance de la
                  programmation
                </h4>
                <div className={cx('fr-text--regular', 'fr-mb-2w')}>
                  Signalez à la coordination nationale que vous avez terminé la
                  phase de consultation.
                </div>
                <Button
                  priority="primary"
                  onClick={regionalValidationModal.open}
                >
                  J'ai terminé
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {programmingPlan.distributionKind === 'SLAUGHTERHOUSE' && (
        <>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <div
              className={clsx('white-container', 'step-container', 'fr-p-3w')}
            >
              <div className="step-number">
                <span className={cx('fr-px-2w')}>01</span>

                <img src={dialog} width="100%" aria-hidden alt="" />
              </div>
              <div className="step-content">
                <h4 className={cx('fr-mb-1w')}>Consultez</h4>
                <span className={cx('fr-text--regular')}>
                  La programmation {programmingPlan.year} est disponible.
                  Parcourez les matrices, leurs analyses et leurs notes
                  additionnelles.
                </span>
              </div>
            </div>
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <div
              className={clsx('white-container', 'step-container', 'fr-p-3w')}
            >
              <div className="step-number">
                <span className={cx('fr-px-2w')}>02</span>
                <img src={distribution} width="100%" aria-hidden alt="" />
              </div>
              <div className="step-content">
                <h4 className={cx('fr-mb-1w')}>Répartissez</h4>
                <div className={cx('fr-text--regular')}>
                  A vous maintenant de répartir les prélèvements entre les
                  différents départements.
                </div>
              </div>
            </div>
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <div
              className={clsx('white-container', 'step-container', 'fr-p-3w')}
            >
              <div className="step-number">
                <span className={cx('fr-px-2w')}>03</span>
                <img src={alert} width="100%" aria-hidden alt="" />
              </div>
              <div className="step-content">
                <h4 className={cx('fr-mb-1w')}>Notifiez </h4>
                <div className={cx('fr-text--regular')}>
                  Signalez aux coordinateurs départementaux que vous avez
                  terminé les phases de répartition.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <ConfirmationModal
        modal={regionalValidationModal}
        title="Veuillez confirmer cette action"
        onConfirm={submit}
        closeOnConfirm
      >
        Vous êtes sur le point de signaler à la coordination nationale que vous
        avez bien pris connaissance, et commenté si besoin, la programmation de
        prélèvements pour 2025.
      </ConfirmationModal>
    </div>
  ) : (
    <div className={clsx(cx('fr-my-3w'), 'white-container')}>
      <Alert
        severity="info"
        small
        title="Vous avez terminé la phase de consultation de la programmation."
        description="La coordination nationale en a été notifiée. "
      />
    </div>
  );
};

export default ProgrammingPlanNotificationRegionalToNational;
