import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  programmingPlan: ProgrammingPlan;
  render: (args: { open: () => void }) => React.ReactNode;
}

const ProgrammingPlanClosing = ({ programmingPlan, render }: Props) => {
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
      {render({
        open: () => closingConfirmationModal.open()
      })}
      <ConfirmationModal
        modal={closingConfirmationModal}
        title={`Clôture des prélèvements ${programmingPlan.year}`}
        children={`Vous êtes sur le point de clôturer l’activité de prélèvements pour l’année ${programmingPlan.year}. Notez qu’une fois cette action, seule l’activité de consultation restera accessible aux utilisateurs.`}
        onConfirm={closeProgrammingPlan}
        confirmLabel="Clôturer"
      />
    </>
  );
};

export default ProgrammingPlanClosing;
