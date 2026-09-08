import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useState } from 'react';
import { ApiClientContext } from '../../../../services/apiClient';

interface Props {
  plans: ProgrammingPlanChecked[];
  onSuccess: () => void;
}

export const bulkLaunchModal = createModal({
  id: 'bulk-launch-modal',
  isOpenedByDefault: false
});

const ProgrammingPlanBulkLaunchModal = ({ plans, onSuccess }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [launchProgrammingPlansCampaign] =
    apiClient.useLaunchProgrammingPlansCampaignMutation();
  const [isError, setIsError] = useState(false);

  const isOpen = useIsModalOpen(bulkLaunchModal, {
    onConceal: () => setIsError(false)
  });

  const submit = async () => {
    setIsError(false);
    try {
      await launchProgrammingPlansCampaign({
        programmingPlanIds: plans.map((plan) => plan.id)
      }).unwrap();
      bulkLaunchModal.close();
      onSuccess();
    } catch {
      setIsError(true);
    }
  };

  return (
    <bulkLaunchModal.Component
      title="Êtes-vous sûr(e) de vouloir lancer la campagne sur les plans ci-dessous ?"
      buttons={[
        { children: 'Annuler', priority: 'secondary' },
        {
          children: 'Lancer la campagne',
          onClick: submit,
          doClosesModal: false
        }
      ]}
    >
      {isOpen && (
        <>
          <ul>
            {plans.map((plan) => (
              <li key={plan.id}>
                {plan.title} ({plan.subPlans.length} sous-plans)
              </li>
            ))}
          </ul>
          <p>
            Cela aura pour effet de permettre la saisie de prélèvements par les
            préleveurs sur les plans lancés pour lesquels les départements ont
            terminé l’attribution des laboratoires (et la répartition entre
            abattoirs).
          </p>
          <p>
            Les préleveurs pourront toujours agir sur les prélèvements de la
            précédente campagne mais ne pourront plus en créer.
          </p>
          {isError && (
            <Alert
              severity="error"
              description="Une erreur est survenue lors du lancement, veuillez réessayer."
              small
              className={cx('fr-mt-2w')}
            />
          )}
        </>
      )}
    </bulkLaunchModal.Component>
  );
};

export default ProgrammingPlanBulkLaunchModal;
