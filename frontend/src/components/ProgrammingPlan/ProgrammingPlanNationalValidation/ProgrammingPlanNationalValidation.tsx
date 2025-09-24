import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Select from '@codegouvfr/react-dsfr/Select';
import { Region, Regions, RegionSort } from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { useCallback, useContext, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import { api } from '../../../services/api.service';
import { ApiClientContext } from '../../../services/apiClient';
import './ProgrammingPlanNationalValidation.scss';
interface Props {
  programmingPlans: ProgrammingPlan[];
}
const submissionModal = createModal({
  id: `submission-modal`,
  isOpenedByDefault: false
});

const ProgrammingPlanNationalValidation = ({ programmingPlans }: Props) => {
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission } = useAuthentication();

  const [updateRegionalStatus] =
    apiClient.useUpdateProgrammingPlanRegionalStatusMutation();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [programmingPlan, setProgrammingPlan] = useState<
    ProgrammingPlan | undefined
  >(programmingPlans.length === 1 ? programmingPlans[0] : undefined);
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
      (programmingPlan?.regionalStatus || [])
        .filter((_) => _.status === status)
        .map((_) => _.region)
        .sort(RegionSort),
    [programmingPlan]
  );

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
                value: programmingPlan?.id || '',
                onChange: (e) =>
                  setProgrammingPlan(
                    programmingPlans.find(
                      (plan) => plan.id === e.target.value
                    ) as ProgrammingPlan
                  )
              }}
              className={cx('fr-mb-1v')}
              disabled={programmingPlans.length <= 1}
            >
              {programmingPlans.map((plan) => (
                <option key={`plan-${plan.id}`} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </Select>
            <hr className={cx('fr-my-2w')} />
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
