import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { sumBy } from 'lodash-es';
import { Region } from 'maestro-shared/referential/Region';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import React, { useContext, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import '../ProgrammingPlanNotification.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  departmentalPrescriptions: LocalPrescription[];
  companyPrescriptions: LocalPrescription[];
}
const submissionModal = createModal({
  id: `submission-modal`,
  isOpenedByDefault: false
});

const ProgrammingPlanNotificationDepartmentalToSampler = ({
  programmingPlan,
  departmentalPrescriptions,
  companyPrescriptions
}: Props) => {
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);
  const { user, hasUserLocalPrescriptionPermission } = useAuthentication();

  const [updateRegionalStatus] =
    apiClient.useUpdateProgrammingPlanRegionalStatusMutation();

  const [isError, setIsError] = useState(false);

  useIsModalOpen(submissionModal, {
    onConceal: () => {
      setIsError(false);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsError(false);
    if (
      programmingPlan &&
      NextProgrammingPlanStatus[programmingPlan.distributionKind][
        'SubmittedToDepartments'
      ]
    ) {
      //TODO introduire un statut départemental
      await updateRegionalStatus({
        programmingPlanId: programmingPlan.id,
        programmingPlanRegionalStatusList: [
          {
            region: user?.region as Region,
            status: NextProgrammingPlanStatus[programmingPlan.distributionKind][
              'SubmittedToDepartments'
            ] as ProgrammingPlanStatus
          }
        ]
      })
        .unwrap()
        .then(() => submissionModal.close())
        .catch(() => {
          setIsError(true);
        });
    }
  };

  if (!user?.region) {
    return <></>;
  }

  return (
    <>
      {departmentalPrescriptions.some(
        (companyPrescription) =>
          hasUserLocalPrescriptionPermission(
            programmingPlan,
            companyPrescription
          )?.distributeToSlaughterhouses &&
          programmingPlan.regionalStatus.some(
            (regionalStatus) =>
              regionalStatus.region === companyPrescription.region &&
              regionalStatus.status === 'SubmittedToDepartments'
          )
      ) && (
        <div className="notify-regions-menu">
          <Button
            iconId="fr-icon-send-plane-fill"
            iconPosition="right"
            id="notify-regions-button"
            onClick={() => submissionModal.open()}
            disabled={departmentalPrescriptions.some(
              (regionalPrescription) =>
                sumBy(
                  companyPrescriptions.filter(
                    (dp) =>
                      dp.prescriptionId === regionalPrescription.prescriptionId
                  ),
                  'sampleCount'
                ) < regionalPrescription.sampleCount
            )}
          >
            Notifier les préleveurs
          </Button>
        </div>
      )}

      <submissionModal.Component
        title="Veuillez confirmer cette action"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary'
          },
          {
            children: 'Confirmer',
            onClick: submit,
            doClosesModal: false
          }
        ]}
      >
        <div>
          Vous êtes sur le point de signaler à la coordination régionale que
          vous avez terminé la phase de consultation et de paramètrage de la
          programmation {programmingPlan.year}.
          <br />
          Les abattoirs ciblés seront également notifier de la future
          programmation de prélèvements.
        </div>
        {isError && (
          <Alert
            severity="error"
            description="Une erreur est survenue lors de l'envoi, veuillez réessayer."
            small
            className={'fr-mt-2w'}
          />
        )}
      </submissionModal.Component>
    </>
  );
};

export default ProgrammingPlanNotificationDepartmentalToSampler;
