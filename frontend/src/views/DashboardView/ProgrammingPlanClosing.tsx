import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  programmingPlan: ProgrammingPlan;
}

const ProgrammingPlanClosing = ({ programmingPlan }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const closingConfirmationModal = useMemo(
    () =>
      createModal({
        id: `closing-confirmation-modal-${programmingPlan.id}`,
        isOpenedByDefault: false
      }),
    [programmingPlan.id]
  );

  const [updateProgrammingPlanStatus] =
    apiClient.useUpdateProgrammingPlanStatusMutation();

  const closeProgrammingPlan = async () => {
    await updateProgrammingPlanStatus({
      programmingPlanId: programmingPlan.id,
      status: 'Closed'
    });
    closingConfirmationModal.close();
  };

  return (
    <>
      <Alert
        severity="warning"
        small
        className={cx('fr-pt-1v')}
        description={
          <div className={clsx('d-flex-align-center')}>
            <b>Rappel : </b>
            clôturez l'activité de prélèvements pour l’année{' '}
            {programmingPlan.year}.
            <Button
              onClick={() => closingConfirmationModal.open()}
              priority="tertiary no outline"
              iconId="fr-icon-arrow-right-s-line"
              iconPosition="right"
              data-testid="close-programming-plan-button"
            >
              Clôturer
            </Button>
          </div>
        }
      />
      <ConfirmationModal
        modal={closingConfirmationModal}
        title={`Clôture des prélèvements ${programmingPlan.year}`}
        children={`Vous êtes sur le point de clôturer l’activité de prélèvements pour l’année ${programmingPlan.year}. Notez qu’une fois cette action, seule l’activité de consultation restera accessible aux utilisateurs.`}
        onConfirm={closeProgrammingPlan}
        confirmLabel="Clôturer"
      />
    </>
  );
};

export default ProgrammingPlanClosing;
