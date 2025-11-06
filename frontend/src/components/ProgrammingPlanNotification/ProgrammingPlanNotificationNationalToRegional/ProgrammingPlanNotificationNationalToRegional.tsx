import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { Region, Regions, RegionSort } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { isDefined } from 'maestro-shared/utils/utils';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import { api } from '../../../services/api.service';
import { ApiClientContext } from '../../../services/apiClient';
import { pluralize } from '../../../utils/stringUtils';
import '../ProgrammingPlanNotification.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
}
const submissionModal = createModal({
  id: `submission-modal`,
  isOpenedByDefault: false
});

const ProgrammingPlanNotificationNationalToRegional = ({
  programmingPlan
}: Props) => {
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission } = useAuthentication();

  const [updateLocalStatus] =
    apiClient.useUpdateProgrammingPlanLocalStatusMutation();

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

  const isOpen = useIsModalOpen(submissionModal, {
    onConceal: () => {
      setIsSuccess(false);
      setIsError(false);
    }
  });

  useEffect(() => {
    setStatus('InProgress');
    setRegionsToNotify(getRegionsByStatus('InProgress'));
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsError(false);
    if (programmingPlan) {
      await updateLocalStatus({
        programmingPlanId: programmingPlan.id,
        programmingPlanLocalStatusList: regionsToNotify.map((region) => ({
          region,
          status: NextProgrammingPlanStatus[programmingPlan.distributionKind][
            status
          ] as ProgrammingPlanStatus
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

  if (!hasUserPermission('manageProgrammingPlan')) {
    return <> </>;
  }

  return (
    <>
      {programmingPlan.regionalStatus.some(
        (regionalStatus) =>
          NextProgrammingPlanStatus[programmingPlan.distributionKind][
            regionalStatus.status
          ] &&
          ['SubmittedToRegion', 'Validated'].includes(
            NextProgrammingPlanStatus[programmingPlan.distributionKind][
              regionalStatus.status
            ] as ProgrammingPlanStatus
          )
      ) && (
        <div className="notify-regions-menu">
          <Button
            iconId="fr-icon-send-plane-fill"
            iconPosition="right"
            id="notify-regions-button"
            onClick={() => submissionModal.open()}
            className="no-wrap"
          >
            Notifier les régions
          </Button>
        </div>
      )}

      <submissionModal.Component
        title={isSuccess ? 'Notification envoyée' : 'Notifier les régions'}
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
            {programmingPlan.distributionKind === 'REGIONAL' && (
              <RadioButtons
                legend="Action"
                options={[
                  {
                    label: 'Soumettre la programmation',
                    nativeInputProps: {
                      checked: status === 'InProgress',
                      onChange: () => {
                        setStatus('InProgress');
                        setRegionsToNotify(getRegionsByStatus('InProgress'));
                      },
                      disabled: getRegionsByStatus('InProgress').length === 0
                    }
                  },
                  {
                    label: 'Valider la programmation',
                    nativeInputProps: {
                      checked: status === 'ApprovedByRegion',
                      onChange: () => {
                        setStatus('ApprovedByRegion');
                        setRegionsToNotify(
                          getRegionsByStatus('ApprovedByRegion')
                        );
                      },
                      disabled:
                        getRegionsByStatus('ApprovedByRegion').length === 0
                    }
                  }
                ].filter(isDefined)}
                orientation="horizontal"
                className={cx('fr-mt-2w')}
              />
            )}
            <hr className={cx('fr-my-2w')} />
            <div className={cx('fr-mt-3w')}>
              {getRegionsByStatus(status).length > 0 ? (
                <Checkbox
                  legend={
                    <div className="d-flex-align-center">
                      <span className="flex-grow-1">
                        Régions (
                        {pluralize(regionsToNotify.length, {
                          preserveCount: true
                        })('sélectionnée')}
                        )
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
                <i>Aucune région concernée</i>
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

export default ProgrammingPlanNotificationNationalToRegional;
