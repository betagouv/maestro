import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { canInitiateNextCampaign } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';

const campaignInitiateModal = createModal({
  id: 'programming-plan-campaign-initiate-modal',
  isOpenedByDefault: false
});

type Props = {
  year: number;
  years: number[];
};

export const ProgrammingPlanCampaignInitiate = ({
  year,
  years,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const { hasAccountPermission } = useAuthentication();
  const [, setSearchParams] = useSearchParams();
  const [initiatedYear, setInitiatedYear] = useState<number>();
  const [createProgrammingPlanCampaign, createCall] =
    apiClient.useCreateProgrammingPlanCampaignMutation();

  useIsModalOpen(campaignInitiateModal, {
    onConceal: () => createCall.reset()
  });

  const submit = async () => {
    await createProgrammingPlanCampaign().unwrap();
    campaignInitiateModal.close();
    setInitiatedYear(year + 1);
    setSearchParams(
      (params) => {
        params.set('year', String(year + 1));
        return params;
      },
      { replace: true }
    );
  };

  return (
    <>
      <AppToast
        open={initiatedYear !== undefined}
        description={`La campagne ${initiatedYear} a été initiée avec succès.`}
        onClose={() => setInitiatedYear(undefined)}
      />
      {hasAccountPermission('administrationMaestro') &&
        canInitiateNextCampaign(years, year, new Date()) && (
          <>
            <Button
              iconId="ri-file-copy-line"
              iconPosition="right"
              onClick={campaignInitiateModal.open}
            >
              Initier la campagne {year + 1}
            </Button>
            <campaignInitiateModal.Component
              title={`Initier la campagne ${year + 1}`}
              concealingBackdrop={false}
              topAnchor
              buttons={[
                {
                  children: 'Annuler',
                  doClosesModal: true,
                  priority: 'secondary'
                },
                {
                  children: `Initier la campagne ${year + 1}`,
                  doClosesModal: false,
                  disabled: createCall.isLoading,
                  onClick: submit
                }
              ]}
            >
              <p className={cx('fr-mb-0')}>
                La campagne {year} sera dupliquée dans son intégralité pour
                servir de base à la campagne {year + 1}.
              </p>
              <AppServiceErrorAlert call={createCall} />
            </campaignInitiateModal.Component>
          </>
        )}
    </>
  );
};
