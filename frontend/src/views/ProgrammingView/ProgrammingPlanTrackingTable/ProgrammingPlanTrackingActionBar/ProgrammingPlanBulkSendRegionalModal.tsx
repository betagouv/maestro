import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { planDistributionKind } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import { hasDepartmentalEchelon } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanEchelon';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useState } from 'react';
import { ApiClientContext } from '../../../../services/apiClient';
import { BulkPlanList } from './BulkPlanList';

interface Props {
  plans: ProgrammingPlanChecked[];
  programmedSubPlanCounts: Map<string, number>;
  modified: boolean;
  onSuccess: () => void;
}

export const bulkSendRegionalModal = createModal({
  id: 'bulk-send-regional-modal',
  isOpenedByDefault: false
});

const ProgrammingPlanBulkSendRegionalModal = ({
  plans,
  programmedSubPlanCounts,
  modified,
  onSuccess
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [sendProgrammingPlansToDepartments] =
    apiClient.useSendProgrammingPlansToDepartmentsMutation();
  const [sendProgrammingPlansToSamplers] =
    apiClient.useSendProgrammingPlansToSamplersMutation();
  const [isError, setIsError] = useState(false);

  const isOpen = useIsModalOpen(bulkSendRegionalModal, {
    onConceal: () => setIsError(false)
  });

  const departmentalEchelonPlans = plans.filter((plan) =>
    hasDepartmentalEchelon(planDistributionKind(plan))
  );
  const regionalKindPlans = plans.filter(
    (plan) => !hasDepartmentalEchelon(planDistributionKind(plan))
  );

  const submit = async () => {
    setIsError(false);
    try {
      const departmentalEchelonPlanIds = departmentalEchelonPlans.map(
        (plan) => plan.id
      );
      const regionalKindPlanIds = regionalKindPlans.map((plan) => plan.id);

      await Promise.all([
        departmentalEchelonPlanIds.length > 0
          ? sendProgrammingPlansToDepartments({
              programmingPlanIds: departmentalEchelonPlanIds
            }).unwrap()
          : undefined,
        regionalKindPlanIds.length > 0
          ? sendProgrammingPlansToSamplers({
              programmingPlanIds: regionalKindPlanIds
            }).unwrap()
          : undefined
      ]);
      bulkSendRegionalModal.close();
      onSuccess();
    } catch {
      setIsError(true);
    }
  };

  const allDepartmentalEchelon = plans.every((plan) =>
    hasDepartmentalEchelon(planDistributionKind(plan))
  );
  const allRegionalKind =
    plans.length > 0 &&
    plans.every((plan) => !hasDepartmentalEchelon(planDistributionKind(plan)));
  const title = allDepartmentalEchelon
    ? 'Envoyer aux départements'
    : allRegionalKind
      ? modified
        ? 'Diffuser les modifications aux préleveurs'
        : 'Diffuser les plans aux préleveurs'
      : 'Envoyer aux départements et/ou aux préleveurs';

  return (
    <bulkSendRegionalModal.Component
      title={title}
      buttons={[
        { children: 'Retour à la page', priority: 'secondary' },
        { children: 'Valider', onClick: submit, doClosesModal: false }
      ]}
    >
      {isOpen && (
        <>
          <p>
            {allRegionalKind
              ? 'Confirmez-vous la diffusion des plans ci-dessous aux préleveurs et préleveuses ?'
              : "Confirmez-vous l'envoi des plans ci-dessous ?"}
          </p>
          {allDepartmentalEchelon || allRegionalKind ? (
            <BulkPlanList
              plans={plans}
              programmedSubPlanCounts={programmedSubPlanCounts}
            />
          ) : (
            <>
              <p className={cx('fr-mb-1v')}>
                <strong>Aux départements :</strong>
              </p>
              <BulkPlanList
                plans={departmentalEchelonPlans}
                programmedSubPlanCounts={programmedSubPlanCounts}
              />
              <p className={cx('fr-mb-1v')}>
                <strong>Aux préleveurs et préleveuses :</strong>
              </p>
              <BulkPlanList
                plans={regionalKindPlans}
                programmedSubPlanCounts={programmedSubPlanCounts}
              />
            </>
          )}
          <p>
            {allRegionalKind
              ? 'En cas de modification, seuls les préleveurs et préleveuses concernées par la/les modifications seront notifiés.'
              : 'En cas de modification, seuls les destinataires concernés par la/les modifications seront notifiés.'}
          </p>
          {isError && (
            <Alert
              severity="error"
              description="Une erreur est survenue lors de l'envoi, veuillez réessayer."
              small
              className={cx('fr-mt-2w')}
            />
          )}
        </>
      )}
    </bulkSendRegionalModal.Component>
  );
};

export default ProgrammingPlanBulkSendRegionalModal;
