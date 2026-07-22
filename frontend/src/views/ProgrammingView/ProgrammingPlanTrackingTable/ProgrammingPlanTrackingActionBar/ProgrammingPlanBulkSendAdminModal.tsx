import Alert from '@codegouvfr/react-dsfr/Alert';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useState } from 'react';
import { ApiClientContext } from '../../../../services/apiClient';

interface Props {
  plans: ProgrammingPlanChecked[];
  onSuccess: () => void;
}

export const bulkSendAdminModal = createModal({
  id: 'bulk-send-admin-modal',
  isOpenedByDefault: false
});

const ProgrammingPlanBulkSendAdminModal = ({ plans, onSuccess }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [sendProgrammingPlansToRegions] =
    apiClient.useSendProgrammingPlansToRegionsMutation();
  const [isError, setIsError] = useState(false);

  const isOpen = useIsModalOpen(bulkSendAdminModal, {
    onConceal: () => setIsError(false)
  });

  const submit = async () => {
    setIsError(false);
    try {
      await sendProgrammingPlansToRegions({
        programmingPlanIds: plans.map((plan) => plan.id)
      }).unwrap();
      bulkSendAdminModal.close();
      onSuccess();
    } catch {
      setIsError(true);
    }
  };

  return (
    <bulkSendAdminModal.Component
      title="Envoyer aux régions"
      buttons={[
        { children: 'Retour à la page', priority: 'secondary' },
        { children: 'Valider', onClick: submit, doClosesModal: false }
      ]}
    >
      {isOpen && (
        <>
          <p>
            Confirmez-vous la diffusion des plans ci-dessous à toutes les
            régions ?
          </p>
          <ul>
            {plans.map((plan) => (
              <li key={plan.id}>
                {plan.title} ({plan.subPlans.length} sous-plans)
              </li>
            ))}
          </ul>
          {isError && (
            <Alert
              severity="error"
              description="Une erreur est survenue lors de l'envoi, veuillez réessayer."
              small
              className="fr-mt-2w"
            />
          )}
        </>
      )}
    </bulkSendAdminModal.Component>
  );
};

export default ProgrammingPlanBulkSendAdminModal;
