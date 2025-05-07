import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { Region, Regions, RegionSort } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import React, { useCallback, useMemo, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import { api } from '../../../services/api.service';
import { useUpdateProgrammingPlanRegionalStatusMutation } from '../../../services/programming-plan.service';
import './ProgrammingPlanNationalValidation.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
}

const ProgrammingPlanNationalValidation = ({ programmingPlan }: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserPermission } = useAuthentication();
  const submissionModal = useMemo(
    () =>
      createModal({
        id: `submission-modal-${programmingPlan.id}`,
        isOpenedByDefault: false
      }),
    [programmingPlan]
  );

  const [updateRegionalStatus] =
    useUpdateProgrammingPlanRegionalStatusMutation();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [status, setStatus] = useState<ProgrammingPlanStatus>('InProgress');
  const [regionsToNotify, setRegionsToNotify] = useState<Region[]>([]);

  useIsModalOpen(submissionModal, {
    onConceal: () => {
      setIsSuccess(false);
      setIsError(false);
      setStatus('InProgress');
      setRegionsToNotify([]);
    }
  });

  const getRegionsByStatus = useCallback(
    (status: ProgrammingPlanStatus) =>
      programmingPlan.regionalStatus
        .filter((_) => _.status === status)
        .map((_) => _.region)
        .sort(RegionSort),
    [programmingPlan.regionalStatus]
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsError(false);
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
  };

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
          onClick={() => submissionModal.open()}
        >
          Notifier les régions
        </Button>
      </div>

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
            La programmation est désormais validée pour
            {regionsToNotify.length > 1 ? ' les régions ' : ' la région '}
            {regionsToNotify.map((region) => Regions[region].name).join(', ')}.
          </>
        ) : (
          <>
            <RadioButtons
              legend="Action"
              options={[
                {
                  label: 'Soumettre la programmation',
                  nativeInputProps: {
                    checked: status === 'InProgress',
                    onChange: () => {
                      setStatus('InProgress');
                      setRegionsToNotify([]);
                    },
                    disabled: getRegionsByStatus('InProgress').length === 0
                  }
                },
                {
                  label: 'Valider la programmation',
                  nativeInputProps: {
                    checked: status === 'Approved',
                    onChange: () => {
                      setStatus('Approved');
                      setRegionsToNotify([]);
                    },
                    disabled: getRegionsByStatus('Approved').length === 0
                  }
                }
              ]}
              orientation="horizontal"
              classes={{
                root: cx('fr-px-0', 'fr-my-0')
              }}
            />
            <div className={cx('fr-mt-3w')}>
              {getRegionsByStatus(status).length > 0 ? (
                <Checkbox
                  legend="Régions"
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

export default ProgrammingPlanNationalValidation;
