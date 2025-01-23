import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo, useState } from 'react';
import {
  getNextProgrammingPlanStatus,
  ProgrammingPlan
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useUpdateProgrammingPlanMutation } from 'src/services/programming-plan.service';
import './ProgrammingPlanUpdateModal.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
}

const ProgrammingPlanUpdateModal = ({ programmingPlan }: Props) => {
  const { hasUserPermission } = useAuthentication();
  const submissionModal = useMemo(
    () =>
      createModal({
        id: `submission-modal-${programmingPlan.id}`,
        isOpenedByDefault: false
      }),
    [programmingPlan]
  );

  const [updateProgrammingPlan] = useUpdateProgrammingPlanMutation();

  const [isError, setIsError] = useState(false);
  const [isDrom, setIsDrom] = useState<boolean>();
  const [nextStatus, setNextStatus] = useState<ProgrammingPlanStatus>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!hasUserPermission('manageProgrammingPlan')) {
    return <> </>;
  }

  return (
    <>
      <div className="notify-regions-menu">
        <Button
          iconId="fr-icon-send-plane-fill"
          iconPosition="right"
          id="notify-regions-button"
          aria-expanded={isMenuOpen}
          aria-controls="notify-regions-menu"
          onClick={() =>
            setTimeout(() => setIsMenuOpen(!isMenuOpen), isMenuOpen ? 200 : 0)
          }
        >
          Notifier les régions
        </Button>
        {isMenuOpen && (
          <div
            className={cx('fr-menu', 'fr-collapse')}
            id="notify-regions-menu"
          >
            <ul className="fr-menu__list">
              {getNextProgrammingPlanStatus(programmingPlan, true) && (
                <li>
                  <Button
                    className={cx('fr-nav__link')}
                    priority="secondary"
                    onClick={() => {
                      setIsDrom(true);
                      setNextStatus(
                        getNextProgrammingPlanStatus(
                          programmingPlan,
                          true
                        ) as ProgrammingPlanStatus
                      );
                      submissionModal.open();
                    }}
                  >
                    {getNextProgrammingPlanStatus(programmingPlan, true) ===
                    'Submitted'
                      ? 'Soumettre DROM'
                      : 'Valider DROM'}
                  </Button>
                </li>
              )}
              {getNextProgrammingPlanStatus(programmingPlan, false) && (
                <li>
                  <Button
                    className={cx('fr-nav__link')}
                    priority="secondary"
                    onClick={() => {
                      setIsDrom(false);
                      setNextStatus(
                        getNextProgrammingPlanStatus(
                          programmingPlan,
                          false
                        ) as ProgrammingPlanStatus
                      );
                      submissionModal.open();
                    }}
                  >
                    {getNextProgrammingPlanStatus(programmingPlan, false) ===
                    'Submitted'
                      ? 'Soumettre hexagone et Corse'
                      : 'Valider hexagone et Corse'}
                  </Button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <ConfirmationModal
        modal={submissionModal}
        title={
          <div>
            Confirmez la
            {nextStatus === 'Submitted'
              ? '  soumission '
              : ' validation '} du programme aux coordinateurs régionaux
            {isDrom ? ' des DROM' : " de l'hexagone et de la Corse"}
          </div>
        }
        onConfirm={async () => {
          await updateProgrammingPlan({
            programmingPlanId: programmingPlan.id,
            programmingPlanUpdate: {
              status: nextStatus as ProgrammingPlanStatus,
              isDrom: isDrom as boolean
            }
          })
            .unwrap()
            .then(() => {
              submissionModal.close();
              setIsMenuOpen(false);
            })
            .catch((_error) => {
              setIsError(true);
            });
        }}
        confirmLabel="Confirmer"
      >
        Vous êtes sur le point de
        {nextStatus === 'Submitted' ? '  soumettre ' : ' valider '} la
        programmation {programmingPlan.year} pour l'ensemble des coordinateurs
        régionaux
        {isDrom ? ' des DROM' : " de l'hexagone et de la Corse"}
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

export default ProgrammingPlanUpdateModal;
