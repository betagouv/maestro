import Alert from '@codegouvfr/react-dsfr/Alert';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useState } from 'react';
import { ApiClientContext } from '../../../../services/apiClient';

interface Props {
  plans: ProgrammingPlanChecked[];
  // Whether every selected plan is already sent and being resent after a
  // modification, as opposed to a first send — only changes the copy for
  // REGIONAL-kind plans (SLAUGHTERHOUSE keeps its own generic wording).
  modified: boolean;
  onSuccess: () => void;
}

export const bulkSendRegionalModal = createModal({
  id: 'bulk-send-regional-modal',
  isOpenedByDefault: false
});

const ProgrammingPlanBulkSendRegionalModal = ({
  plans,
  modified,
  onSuccess
}: Props) => {
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

  // REGIONAL plans have no department echelon — this same action sends the
  // region's approval straight up to National, and is described to the
  // préleveurs-facing region's own coordinator as "diffuser aux préleveurs"
  // rather than the SLAUGHTERHOUSE department-cascade wording.
  const allSlaughterhouse = plans.every(
    (plan) => plan.distributionKind === 'SLAUGHTERHOUSE'
  );
  const allRegionalKind =
    plans.length > 0 &&
    plans.every((plan) => plan.distributionKind !== 'SLAUGHTERHOUSE');
  const title = allSlaughterhouse
    ? 'Envoyer aux départements'
    : allRegionalKind
      ? modified
        ? 'Diffuser les modifications aux préleveurs'
        : 'Diffuser les plans aux préleveurs'
      : 'Envoyer';

  return (
    <bulkSendRegionalModal.Component
      title={title}
      buttons={[
        { children: 'Retour à la page', priority: 'secondary' },
        { children: 'Valider', onClick: submit, doClosesModal: false }
      ]}
    >
      {isOpen && (
        <>
          <p>
            {allRegionalKind
              ? 'Confirmez-vous la diffusion des plans ci-dessous aux préleveurs et préleveuses ?'
              : "Confirmez-vous l'envoi des plans ci-dessous ?"}
          </p>
          <ul>
            {plans.map((plan) => (
              <li key={plan.id}>
                {plan.title} ({plan.subPlans.length} sous-plans)
              </li>
            ))}
          </ul>
          <p>
            {allRegionalKind
              ? 'En cas de modification, seuls les préleveurs et préleveuses concernés par la/les modifications seront notifiés.'
              : 'En cas de modification, seuls les destinataires concernés par la/les modifications seront notifiés.'}
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
