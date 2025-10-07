import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import { sumBy } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { NextProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import React, { useContext, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import { api } from '../../../services/api.service';
import { ApiClientContext } from '../../../services/apiClient';
import { pluralize } from '../../../utils/stringUtils';
import '../ProgrammingPlanNotification.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  regionalPrescriptions: LocalPrescription[];
  departmentalPrescriptions: LocalPrescription[];
}
const submissionModal = createModal({
  id: `submission-modal`,
  isOpenedByDefault: false
});

const ProgrammingPlanNotificationRegionalToDepartmental = ({
  programmingPlan,
  regionalPrescriptions,
  departmentalPrescriptions
}: Props) => {
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);
  const { user, hasUserLocalPrescriptionPermission } = useAuthentication();

  const [updateRegionalStatus] =
    apiClient.useUpdateProgrammingPlanRegionalStatusMutation();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [departmentsToNotify, _] = useState(
    Regions[user?.region as Region].departments
  );

  useIsModalOpen(submissionModal, {
    onConceal: () => {
      setIsSuccess(false);
      setIsError(false);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsError(false);
    if (programmingPlan) {
      await updateRegionalStatus({
        programmingPlanId: programmingPlan.id,
        programmingPlanRegionalStatusList: [
          {
            region: user?.region as Region,
            status:
              NextProgrammingPlanStatus[programmingPlan.distributionKind][
                'SubmittedToRegion'
              ]
          }
        ]
      })
        .unwrap()
        .then(() => {
          setIsSuccess(true);
        })
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
      {regionalPrescriptions.some(
        (regionalPrescription) =>
          hasUserLocalPrescriptionPermission(
            programmingPlan,
            regionalPrescription
          )?.distributeToDepartments &&
          programmingPlan.regionalStatus.some(
            (regionalStatus) =>
              regionalStatus.region === regionalPrescription.region &&
              regionalStatus.status === 'SubmittedToRegion'
          )
      ) && (
        <div className="notify-regions-menu">
          <Button
            iconId="fr-icon-send-plane-fill"
            iconPosition="right"
            id="notify-regions-button"
            onClick={() => submissionModal.open()}
            disabled={regionalPrescriptions.some(
              (regionalPrescription) =>
                sumBy(
                  departmentalPrescriptions.filter(
                    (dp) =>
                      dp.prescriptionId === regionalPrescription.prescriptionId
                  ),
                  'sampleCount'
                ) < regionalPrescription.sampleCount
            )}
          >
            Notifier les départements
          </Button>
        </div>
      )}

      <submissionModal.Component
        title={isSuccess ? 'Notification envoyée' : 'Notifier les départements'}
        buttons={
          isSuccess
            ? [
                {
                  children: 'Fermer',
                  priority: 'secondary',
                  onClick: () =>
                    dispatch(api.util.invalidateTags(['ProgrammingPlan']))
                }
              ]
            : [
                {
                  children: 'Annuler',
                  priority: 'secondary'
                },
                {
                  children: 'Envoyer',
                  onClick: submit,
                  doClosesModal: false,
                  disabled: departmentsToNotify.length === 0
                }
              ]
        }
      >
        {isSuccess ? (
          <>
            La soumission de la programmation a bien été envoyée aux départments{' '}
            <b>
              {departmentsToNotify
                .map((department) => DepartmentLabels[department])
                .join(', ')}
              .
            </b>
          </>
        ) : (
          <>
            <Select
              label="Plan"
              nativeSelectProps={{
                value: programmingPlan.id
              }}
              className={cx('fr-mb-1v')}
              disabled
            >
              <option
                key={`plan-${programmingPlan.id}`}
                value={programmingPlan.id}
              >
                {programmingPlan.title}
              </option>
            </Select>
            <hr className={cx('fr-my-2w')} />
            <div className={cx('fr-mt-3w')}>
              <Checkbox
                legend={
                  <div className="d-flex-align-center">
                    <span className="flex-grow-1">
                      Départements ({departmentsToNotify.length}{' '}
                      {pluralize(departmentsToNotify.length)('sélectionnée')})
                    </span>
                  </div>
                }
                options={departmentsToNotify.map((department) => ({
                  label: DepartmentLabels[department],
                  nativeInputProps: {
                    checked: true,
                    disabled: true
                  }
                }))}
                orientation="horizontal"
              />
            </div>
          </>
        )}
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

export default ProgrammingPlanNotificationRegionalToDepartmental;
