import Alert from '@codegouvfr/react-dsfr/Alert';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useState } from 'react';
import { ApiClientContext } from '../../../../services/apiClient';

interface Props {
  plansToAdmin: ProgrammingPlanChecked[];
  plansToRegions: ProgrammingPlanChecked[];
  onSuccess: () => void;
}

export const bulkSendNationalModal = createModal({
  id: 'bulk-send-national-modal',
  isOpenedByDefault: false
});

const ProgrammingPlanBulkSendNationalModal = ({
  plansToAdmin,
  plansToRegions,
  onSuccess
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [sendProgrammingPlansToRegions] =
    apiClient.useSendProgrammingPlansToRegionsMutation();
  const [isError, setIsError] = useState(false);

  const isOpen = useIsModalOpen(bulkSendNationalModal, {
    onConceal: () => setIsError(false)
  });

  const submit = async () => {
    setIsError(false);
    try {
      await sendProgrammingPlansToRegions({
        programmingPlanIds: [...plansToAdmin, ...plansToRegions].map(
          (plan) => plan.id
        )
      }).unwrap();
      bulkSendNationalModal.close();
      onSuccess();
    } catch {
      setIsError(true);
    }
  };

  return (
    <bulkSendNationalModal.Component
      title="Soumettre les plans à l'admin et/ou aux régions"
      buttons={[
        { children: 'Retour à la page', priority: 'secondary' },
        { children: 'Valider', onClick: submit, doClosesModal: false }
      ]}
    >
      {isOpen && (
        <>
          <p>Confirmez-vous la diffusion des plans ci-dessous :</p>
          {plansToAdmin.length > 0 && (
            <>
              <p className="fr-mb-1v">
                <strong>À l'administrateur :</strong>
              </p>
              <ul>
                {plansToAdmin.map((plan) => (
                  <li key={plan.id}>
                    {plan.title} ({plan.subPlans.length} sous-plans)
                  </li>
                ))}
              </ul>
            </>
          )}
          {plansToRegions.length > 0 && (
            <>
              <p className="fr-mb-1v">
                <strong>Aux régions :</strong>
              </p>
              <ul>
                {plansToRegions.map((plan) => (
                  <li key={plan.id}>
                    {plan.title} ({plan.subPlans.length} sous-plans)
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="fr-text--sm">
            En cas de modification, seules les régions concernées par la/les
            modifications seront notifiées.
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
    </bulkSendNationalModal.Component>
  );
};

export default ProgrammingPlanBulkSendNationalModal;
