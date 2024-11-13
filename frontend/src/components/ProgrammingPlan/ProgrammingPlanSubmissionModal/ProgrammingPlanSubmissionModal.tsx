import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo, useState } from 'react';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useUpdateProgrammingPlanMutation } from 'src/services/programming-plan.service';
interface Props {
  programmingPlan: ProgrammingPlan;
}

const ProgrammingPlanSubmissionModal = ({ programmingPlan }: Props) => {
  const { hasPermission } = useAuthentication();
  const submissionModal = useMemo(
    () =>
      createModal({
        id: `submission-modal-${programmingPlan.id}`,
        isOpenedByDefault: false,
      }),
    [programmingPlan]
  );

  const [updateProgrammingPlan] = useUpdateProgrammingPlanMutation();

  const [isError, setIsError] = useState(false);

  if (
    !hasPermission('manageProgrammingPlan') ||
    programmingPlan.status !== 'InProgress'
  ) {
    return <> </>;
  }

  return (
    <>
      <Button
        iconId="fr-icon-send-plane-fill"
        iconPosition="right"
        priority="primary"
        onClick={submissionModal.open}
      >
        Soumettre aux régions
      </Button>
      <ConfirmationModal
        modal={submissionModal}
        title={
          <div className="no-wrap">
            Confirmez l’envoi aux coordinateurs régionaux
          </div>
        }
        onConfirm={async () => {
          await updateProgrammingPlan({
            programmingPlanId: programmingPlan.id,
            programmingPlanUpdate: {
              status: 'Submitted',
            },
          })
            .unwrap()
            .then((newProgrammingPlan) => {
              //TODO
              submissionModal.close();
            })
            .catch((error) => {
              setIsError(true);
            });
        }}
        confirmLabel="Confirmer"
      >
        Vous êtes sur le point de partager la programmation 
        {programmingPlan.year} aux coordinateurs des régions.
        {isError && (
          <Alert
            severity="error"
            description="Une erreur est survenue lors de l'envoi, veuillez réessayer."
            small
            className={'fr-mt-2w'}
          />
        )}
      </ConfirmationModal>
    </>
  );
};

export default ProgrammingPlanSubmissionModal;
