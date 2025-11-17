import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Region } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo } from 'react';
import alert from '../../../assets/illustrations/alert.svg';
import check from '../../../assets/illustrations/check.svg';
import dialog from '../../../assets/illustrations/dialog.svg';
import distribution from '../../../assets/illustrations/distribution.svg';
import ConfirmationModal from '../../../components/ConfirmationModal/ConfirmationModal';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import './ProgrammingInstructions.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
}

const ProgrammingInstructions = ({ programmingPlan }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { hasRegionalView, hasDepartmentalView, user } = useAuthentication();

  const regionalValidationModal = createModal({
    id: `regional-validation-modal`,
    isOpenedByDefault: false
  });

  const [updateLocalStatus] =
    apiClient.useUpdateProgrammingPlanLocalStatusMutation();

  const submit = async () => {
    await updateLocalStatus({
      programmingPlanId: programmingPlan.id,
      programmingPlanLocalStatusList: [
        {
          region: user?.region as Region,
          status: 'ApprovedByRegion'
        }
      ]
    });
  };

  const status = useMemo(
    () =>
      user?.department
        ? programmingPlan.departmentalStatus.find(
            (status) =>
              status.region === user?.region &&
              status.department === user?.department
          )?.status
        : programmingPlan.regionalStatus.find(
            (status) => status.region === user?.region
          )?.status,
    [programmingPlan, user]
  );

  const instructionSteps = useMemo(() => {
    if (hasRegionalView && status === 'SubmittedToRegion') {
      if (programmingPlan.distributionKind === 'REGIONAL') {
        return [
          {
            title: 'Consultez les objectifs de prélèvements par matrice',
            logo: dialog,
            content: (
              <div className={cx('fr-text--regular', 'fr-mb-4w')}>
                La programmation {programmingPlan.year} vous est désormais
                partagée. Ajoutez si besoin vos commentaires afin de les
                remonter à la coordination nationale.
              </div>
            )
          },
          {
            title:
              'Notifiez que vous avez bien pris connaissance de la programmation',
            logo: check,
            content: (
              <div className={cx('fr-text--regular', 'fr-mb-2w')}>
                Signalez à la coordination nationale que vous avez terminé la
                phase de consultation.
              </div>
            ),
            action: (
              <Button priority="primary" onClick={regionalValidationModal.open}>
                J'ai terminé
              </Button>
            )
          }
        ];
      }

      if (programmingPlan.distributionKind === 'SLAUGHTERHOUSE') {
        return [
          {
            title: 'Consultez',
            logo: dialog,
            content: (
              <span className={cx('fr-text--regular')}>
                La programmation {programmingPlan.year} est disponible.
                Parcourez les matrices, leurs analyses et leurs notes
                additionnelles.
              </span>
            )
          },
          {
            title: 'Répartissez',
            logo: distribution,
            content: (
              <div className={cx('fr-text--regular')}>
                A vous maintenant de répartir les prélèvements entre les
                différents départements.
              </div>
            )
          },
          {
            title: 'Notifiez',
            logo: alert,
            content: (
              <div className={cx('fr-text--regular')}>
                Signalez aux coordinateurs départementaux que vous avez terminé
                les phases de répartition.
              </div>
            )
          }
        ];
      }
    }

    if (hasDepartmentalView && status === 'SubmittedToDepartments') {
      return [
        {
          title: 'Consultez les objectifs de prélèvements par matrice',
          logo: dialog,
          content: (
            <span className={cx('fr-text--regular')}>
              La programmation {programmingPlan.year} vous est désormais
              partagée. Parcourez les matrices, leurs analyses et leurs notes
              additionnelles.
            </span>
          )
        },
        {
          title:
            'Répartissez les prélèvements entre abattoirs et attribuez un laboratoire destinataire',
          logo: distribution,
          content: (
            <div className={cx('fr-text--regular')}>
              Pour chaque abattoir, précisez le nombre de prélèvements et le
              laboratoire associé.
            </div>
          )
        }
      ];
    }

    return null;
  }, [
    status,
    hasRegionalView,
    hasDepartmentalView,
    programmingPlan,
    regionalValidationModal
  ]);

  if (hasRegionalView && status === 'ApprovedByRegion') {
    return (
      <div className={clsx(cx('fr-my-3w'), 'white-container')}>
        <Alert
          severity="info"
          small
          title="Vous avez terminé la phase de consultation de la programmation."
          description="La coordination nationale en a été notifiée. "
        />
      </div>
    );
  }

  if (!instructionSteps) {
    return <></>;
  }

  return (
    <>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-1w')}>
        {instructionSteps.map((step, index) => (
          <div
            key={index}
            className={cx(
              'fr-col-12',
              instructionSteps.length === 2 ? 'fr-col-sm-6' : 'fr-col-sm-4'
            )}
          >
            <div
              className={clsx(
                'white-container',
                'instructions-step-container',
                'fr-p-3w'
              )}
            >
              <div className="step-number">
                <span className={cx('fr-px-2w')}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <img src={step.logo} width="100%" aria-hidden alt="" />
              </div>
              <div className="step-content">
                <h4 className={cx('fr-mb-1w')}>{step.title}</h4>
                {step.content}
                {step.action}
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasRegionalView && programmingPlan.distributionKind === 'REGIONAL' && (
        <ConfirmationModal
          modal={regionalValidationModal}
          title="Veuillez confirmer cette action"
          onConfirm={submit}
          closeOnConfirm
        >
          Vous êtes sur le point de signaler à la coordination nationale que
          vous avez bien pris connaissance, et commenté si besoin, la
          programmation de prélèvements pour {programmingPlan.year}
        </ConfirmationModal>
      )}
    </>
  );
};

export default ProgrammingInstructions;
