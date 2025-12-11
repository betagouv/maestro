import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { isNil, sumBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Region } from 'maestro-shared/referential/Region';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import React, { useContext, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
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
  const apiClient = useContext(ApiClientContext);
  const { user, hasUserLocalPrescriptionPermission } = useAuthentication();

  const [updateLocalStatus] =
    apiClient.useUpdateProgrammingPlanLocalStatusMutation();

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
      await updateLocalStatus({
        programmingPlanId: programmingPlan.id,
        programmingPlanLocalStatusList: [
          {
            region: user?.region as Region,
            department: user?.department as Department,
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

  console.log(departmentalPrescriptions);

  return (
    <>
      {departmentalPrescriptions.some(
        (companyPrescription) =>
          hasUserLocalPrescriptionPermission(
            programmingPlan,
            companyPrescription
          )?.distributeToSlaughterhouses &&
          programmingPlan.departmentalStatus?.some(
            (departmentalStatus) =>
              departmentalStatus.region === companyPrescription.region &&
              departmentalStatus.department ===
                companyPrescription.department &&
              departmentalStatus.status === 'SubmittedToDepartments'
          )
      ) && (
        <div className="notify-regions-menu">
          <Button
            iconId="fr-icon-send-plane-fill"
            iconPosition="right"
            id="notify-regions-button"
            onClick={() => submissionModal.open()}
            disabled={departmentalPrescriptions.some(
              (departmentalPrescription) =>
                !departmentalPrescription.substanceKindsLaboratories?.length ||
                departmentalPrescription.substanceKindsLaboratories?.some(
                  (substanceKindLaboratory) =>
                    isNil(substanceKindLaboratory.laboratoryId)
                ) ||
                sumBy(
                  companyPrescriptions.filter(
                    (dp) =>
                      dp.prescriptionId ===
                      departmentalPrescription.prescriptionId
                  ),
                  'sampleCount'
                ) < departmentalPrescription.sampleCount
            )}
          >
            Envoyer aux préleveurs
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
          Vous êtes sur le point de signaler aux préleveurs des abattoirs ciblés
          le lancement de la campagne de prélèvements pour l'année{' '}
          {programmingPlan.year}.
          <br />
          La coordination régionale sera également notifiée que vous avez
          terminé la phase de consultation et de paramètrage de la future
          programmation.
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
