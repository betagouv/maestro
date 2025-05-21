import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Region } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import check from '../../../assets/illustrations/check.svg';
import dialog from '../../../assets/illustrations/dialog.svg';
import { useUpdateProgrammingPlanRegionalStatusMutation } from '../../../services/programming-plan.service';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import './ProgrammingPlanRegionalValidation.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  region: Region;
}

const ProgrammingPlanRegionalValidation = ({
  programmingPlan,
  region
}: Props) => {
  const regionalValidationModal = createModal({
    id: `regional-validation-modal`,
    isOpenedByDefault: false
  });

  const [updateRegionalStatus] =
    useUpdateProgrammingPlanRegionalStatusMutation();

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

  if (status && !['Submitted', 'Approved'].includes(status)) {
    return <></>;
  }

  return status === 'Submitted' ? (
    <>
      <div className={cx('fr-col-12', 'fr-col-sm-6')}>
        <div className={clsx('white-container', 'step-container', 'fr-p-4w')}>
          <div className="step-number">
            <span className={cx('fr-px-2w')}>01</span>

            <img src={dialog} width="100%" aria-hidden alt="" />
          </div>
          <div className="step-content">
            <h4 className={cx('fr-mb-1w')}>
              Consultez les objectifs de prélèvements par matrice
            </h4>
            <span className={cx('fr-text--lg')}>
              La programmation 2025 vous est désormais partagée. Ajoutez si
              besoin vos commentaires afin de les remonter à la coordination
              nationale.
            </span>
          </div>
        </div>
      </div>
      <div className={cx('fr-col-12', 'fr-col-sm-6')}>
        <div className={clsx('white-container', 'step-container', 'fr-p-4w')}>
          <div className="step-number">
            <span className={cx('fr-px-2w')}>02</span>
            <img src={check} width="100%" aria-hidden alt="" />
          </div>
          <div className="step-content">
            <h4 className={cx('fr-mb-1w')}>
              Notifiez que vous avez bien pris connaissance de la programmation
            </h4>
            <div className={cx('fr-text--lg', 'fr-mb-2w')}>
              Signalez à la coordination nationale que vous avez terminé la
              phase de consultation.
            </div>
            <Button priority="primary" onClick={regionalValidationModal.open}>
              J'ai terminé
            </Button>
          </div>
        </div>
      </div>
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
    </>
  ) : (
    <div className={cx('fr-col-12')}>
      <Alert
        severity="info"
        small
        title="Vous avez terminé la phase de consultation de la programmation."
        description="La coordination nationale en a été notifiée. "
      />
    </div>
  );
};

export default ProgrammingPlanRegionalValidation;
