import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { Region, Regions, RegionSort } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import React, { useCallback, useContext, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import { api } from '../../../services/api.service';
import { ApiClientContext } from '../../../services/apiClient';
import { pluralize } from '../../../utils/stringUtils';
import '../ProgrammingPlanNotification.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  regionalPrescriptions: RegionalPrescription[];
}
const submissionModal = createModal({
  id: `submission-modal`,
  isOpenedByDefault: false
});

const ProgrammingPlanNotificationRegionalToDepartmental = ({
  programmingPlan,
  regionalPrescriptions
}: Props) => {
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);
  const { user, hasUserRegionalPrescriptionPermission } = useAuthentication();

  const [updateRegionalStatus] =
    apiClient.useUpdateProgrammingPlanRegionalStatusMutation();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const getRegionsByStatus = useCallback(
    (status: ProgrammingPlanStatus) =>
      (programmingPlan?.regionalStatus || [])
        .filter((_) => _.status === status)
        .map((_) => _.region)
        .sort(RegionSort),
    [programmingPlan]
  );

  const [status, setStatus] = useState<ProgrammingPlanStatus>('InProgress');
  const [regionsToNotify, setRegionsToNotify] = useState<Region[]>(
    getRegionsByStatus('InProgress')
  );

  useIsModalOpen(submissionModal, {
    onConceal: () => {
      setIsSuccess(false);
      setIsError(false);
      setStatus('InProgress');
      setRegionsToNotify([]);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsError(false);
    if (programmingPlan) {
      await updateRegionalStatus({
        programmingPlanId: programmingPlan.id,
        programmingPlanRegionalStatusList: regionsToNotify.map((region) => ({
          region,
          status: NextProgrammingPlanStatus[status] as ProgrammingPlanStatus
        }))
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

  if (
    !regionalPrescriptions.some(
      (regionalPrescription) =>
        hasUserRegionalPrescriptionPermission(
          programmingPlan,
          regionalPrescription
        )?.distributeToDepartments
    )
  ) {
    return <> </>;
  }

  return (
    <>
      <div className="notify-regions-menu">
        <Button
          iconId="fr-icon-send-plane-fill"
          iconPosition="right"
          id="notify-regions-button"
          onClick={() => submissionModal.open()}
        >
          Notifier les départements
        </Button>
      </div>

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
                  disabled: regionsToNotify.length === 0
                }
              ]
        }
      >
        {isSuccess ? (
          <>
            {status === 'InProgress'
              ? 'La soumission de la programmation a bien été envoyée pour'
              : 'La programmation est désormais validée pour'}
            {regionsToNotify.length > 1 ? ' les régions ' : ' la région '}
            <b>
              {regionsToNotify.map((region) => Regions[region].name).join(', ')}
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
              {getRegionsByStatus(status).length > 0 ? (
                <Checkbox
                  legend={
                    <div className="d-flex-align-center">
                      <span className="flex-grow-1">
                        Régions ({regionsToNotify.length}{' '}
                        {pluralize(regionsToNotify.length)('sélectionnée')})
                      </span>
                      <Button
                        onClick={() =>
                          setRegionsToNotify(
                            regionsToNotify.length ===
                              getRegionsByStatus(status).length
                              ? []
                              : getRegionsByStatus(status)
                          )
                        }
                        priority="tertiary no outline"
                        className={clsx(cx('fr-link--sm'), 'link-underline')}
                      >
                        Tout{' '}
                        {getRegionsByStatus(status).length ===
                        regionsToNotify.length
                          ? 'désélectionner'
                          : 'sélectionner'}
                      </Button>
                    </div>
                  }
                  options={getRegionsByStatus(status).map((region) => ({
                    label: Regions[region].name,
                    nativeInputProps: {
                      checked: regionsToNotify.includes(region),
                      onChange: () =>
                        setRegionsToNotify((prev) => {
                          if (prev.includes(region)) {
                            return prev.filter((_) => _ !== region);
                          } else {
                            return [...prev, region];
                          }
                        })
                    }
                  }))}
                  orientation="horizontal"
                />
              ) : (
                <i>Aucun département concerné</i>
              )}
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
