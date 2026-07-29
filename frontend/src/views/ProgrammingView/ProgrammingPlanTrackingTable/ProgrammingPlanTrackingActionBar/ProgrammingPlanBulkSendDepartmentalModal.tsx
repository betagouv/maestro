import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import {
  NextProgrammingPlanStatus,
  type ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useState } from 'react';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../../services/apiClient';

interface Props {
  plans: ProgrammingPlanChecked[];
  modified: boolean;
  onSuccess: () => void;
}

export const bulkSendDepartmentalModal = createModal({
  id: 'bulk-send-departmental-modal',
  isOpenedByDefault: false
});

const ProgrammingPlanBulkSendDepartmentalModal = ({
  plans,
  modified,
  onSuccess
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { user } = useAuthentication();
  const [updateLocalStatus] =
    apiClient.useUpdateProgrammingPlanLocalStatusMutation();
  const [isError, setIsError] = useState(false);

  const isOpen = useIsModalOpen(bulkSendDepartmentalModal, {
    onConceal: () => setIsError(false)
  });

  const submit = async () => {
    setIsError(false);
    try {
      await Promise.all(
        plans.map((plan) =>
          updateLocalStatus({
            programmingPlanId: plan.id,
            programmingPlanLocalStatusList: [
              {
                region: user?.region as Region,
                department: user?.department as Department,
                status: NextProgrammingPlanStatus[plan.distributionKind][
                  'SubmittedToDepartments'
                ] as ProgrammingPlanStatus
              }
            ]
          }).unwrap()
        )
      );
      bulkSendDepartmentalModal.close();
      onSuccess();
    } catch {
      setIsError(true);
    }
  };

  const title = modified
    ? 'Diffuser les modifications aux préleveurs'
    : 'Lancer la campagne';

  return (
    <bulkSendDepartmentalModal.Component
      title={title}
      buttons={[
        { children: 'Retour à la page', priority: 'secondary' },
        { children: 'Valider', onClick: submit, doClosesModal: false }
      ]}
    >
      {isOpen && (
        <>
          <p>
            Confirmez-vous la diffusion des plans ci-dessous aux préleveurs et
            préleveuses ?
          </p>
          <ul>
            {plans.map((plan) => (
              <li key={plan.id}>
                {plan.title} ({plan.subPlans.length} sous-plans)
              </li>
            ))}
          </ul>
          <p>
            En cas de modification, seuls les préleveurs et préleveuses
            concernés par la/les modifications seront notifiés.
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
    </bulkSendDepartmentalModal.Component>
  );
};

export default ProgrammingPlanBulkSendDepartmentalModal;
