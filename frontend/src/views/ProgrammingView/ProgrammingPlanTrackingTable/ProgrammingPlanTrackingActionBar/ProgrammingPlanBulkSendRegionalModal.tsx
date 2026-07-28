import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useState } from 'react';
import { ApiClientContext } from '../../../../services/apiClient';

interface Props {
  plans: ProgrammingPlanChecked[];
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
  const [sendProgrammingPlansToSamplers] =
    apiClient.useSendProgrammingPlansToSamplersMutation();
  const [isError, setIsError] = useState(false);

  const isOpen = useIsModalOpen(bulkSendRegionalModal, {
    onConceal: () => setIsError(false)
  });

  const submit = async () => {
    setIsError(false);
    try {
      const slaughterhousePlanIds = plans
        .filter((plan) => plan.distributionKind === 'SLAUGHTERHOUSE')
        .map((plan) => plan.id);
      const regionalKindPlanIds = plans
        .filter((plan) => plan.distributionKind !== 'SLAUGHTERHOUSE')
        .map((plan) => plan.id);

      await Promise.all([
        slaughterhousePlanIds.length > 0
          ? sendProgrammingPlansToDepartments({
              programmingPlanIds: slaughterhousePlanIds
            }).unwrap()
          : undefined,
        regionalKindPlanIds.length > 0
          ? sendProgrammingPlansToSamplers({
              programmingPlanIds: regionalKindPlanIds
            }).unwrap()
          : undefined
      ]);
      bulkSendRegionalModal.close();
      onSuccess();
    } catch {
      setIsError(true);
    }
  };

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
              className={cx('fr-mt-2w')}
            />
          )}
        </>
      )}
    </bulkSendRegionalModal.Component>
  );
};

export default ProgrammingPlanBulkSendRegionalModal;
