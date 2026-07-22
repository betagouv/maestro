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

export const bulkSendRegionalModal = createModal({
  id: 'bulk-send-regional-modal',
  isOpenedByDefault: false
});

const ProgrammingPlanBulkSendRegionalModal = ({ plans, onSuccess }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [sendProgrammingPlansToDepartments] =
    apiClient.useSendProgrammingPlansToDepartmentsMutation();
  const [isError, setIsError] = useState(false);

  const isOpen = useIsModalOpen(bulkSendRegionalModal, {
    onConceal: () => setIsError(false)
  });

  const submit = async () => {
    setIsError(false);
    try {
      await sendProgrammingPlansToDepartments({
        programmingPlanIds: plans.map((plan) => plan.id)
      }).unwrap();
      bulkSendRegionalModal.close();
      onSuccess();
    } catch {
      setIsError(true);
    }
  };

  return (
    <bulkSendRegionalModal.Component
      title="Envoyer aux départements"
      buttons={[
        { children: 'Retour à la page', priority: 'secondary' },
        { children: 'Valider', onClick: submit, doClosesModal: false }
      ]}
    >
      {isOpen && (
        <>
          <p>
            Confirmez-vous la diffusion des plans ci-dessous à tous les
            départements ?
          </p>
          <ul>
            {plans.map((plan) => (
              <li key={plan.id}>
                {plan.title} ({plan.subPlans.length} sous-plans)
              </li>
            ))}
          </ul>
          <p>
            En cas de modification, seuls les départements concernés par la/les
            modifications seront notifiés.
          </p>
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
    </bulkSendRegionalModal.Component>
  );
};

export default ProgrammingPlanBulkSendRegionalModal;
