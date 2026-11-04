import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import { subPlanNumbersMissingAgreements } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { LaboratoryAgreementDiffusion } from 'maestro-shared/schema/Laboratory/LaboratoryAgreementDiffusion';
import { useContext, useMemo, useState } from 'react';
import AppToast from 'src/components/_app/AppToast/AppToast';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../services/apiClient';

const diffusionModal = createModal({
  id: 'laboratory-agreements-diffusion-modal',
  isOpenedByDefault: false
});

const refusalModal = createModal({
  id: 'laboratory-agreements-diffusion-refusal-modal',
  isOpenedByDefault: false
});

interface Props {
  year: number;
  diffusion?: LaboratoryAgreementDiffusion;
}

export const LaboratoryAgreementsDiffusionAction = ({
  year,
  diffusion,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission } = useAuthentication();
  const [diffuseLaboratoryAgreements] =
    apiClient.useDiffuseLaboratoryAgreementsMutation();
  const [diffusionSuccess, setDiffusionSuccess] = useState(false);

  const canDiffuse =
    isNil(diffusion) && hasUserPermission('diffuseLaboratoryAgreements');

  const { data: agreements = [] } = apiClient.useFindLaboratoryAgreementsQuery(
    { year },
    { skip: !canDiffuse }
  );
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({}, { skip: !canDiffuse });

  const missingSubPlanNumbers = useMemo(
    () =>
      subPlanNumbersMissingAgreements(
        programmingPlans
          .filter((programmingPlan) => programmingPlan.year === year)
          .flatMap((programmingPlan) => programmingPlan.subPlans),
        agreements
      ),
    [programmingPlans, agreements, year]
  );

  if (!isNil(diffusion)) {
    if (!hasUserPermission('readUndiffusedLaboratoryAgreements')) {
      return null;
    }
    return (
      <div className={clsx('d-flex-align-center', cx('fr-text--sm'))}>
        <span
          className={cx(
            'fr-icon-checkbox-circle-fill',
            'fr-label--success',
            'fr-mr-1w'
          )}
          aria-hidden="true"
        />
        <span>
          <b>LabCam diffusé</b>
          <br />
          Le {new Date(diffusion.diffusedAt).toLocaleDateString('fr-FR')}
        </span>
      </div>
    );
  }

  if (!canDiffuse) {
    return null;
  }

  return (
    <>
      <Button
        iconId="fr-icon-send-plane-fill"
        onClick={() =>
          missingSubPlanNumbers.length > 0
            ? refusalModal.open()
            : diffusionModal.open()
        }
      >
        Diffuser le LabCam
      </Button>
      <ConfirmationModal
        modal={diffusionModal}
        title={`Êtes-vous sûr(e) de vouloir diffuser le LabCam ${year} ?`}
        confirmLabel="Diffuser le LabCam"
        closeOnConfirm
        onConfirm={async () => {
          await diffuseLaboratoryAgreements({ year }).unwrap();
          setDiffusionSuccess(true);
        }}
      >
        Cela aura pour effet de rendre visible le LabCam {year} à tous les
        utilisateurs et utilisatrices de Maestro.
      </ConfirmationModal>
      <refusalModal.Component
        title={`Vous ne pouvez pas diffuser le LabCam ${year} aux utilisateurs et utilisatrices de Maestro car le ou les sous-plans suivants n'ont pas de laboratoires attribués :`}
        concealingBackdrop={false}
        topAnchor
        buttons={[{ children: 'Fermer', priority: 'secondary' }]}
      >
        <ul>
          {missingSubPlanNumbers.map((subPlanNumber) => (
            <li key={subPlanNumber}>{subPlanNumber}</li>
          ))}
        </ul>
      </refusalModal.Component>
      <AppToast
        open={diffusionSuccess}
        description={`Le LabCam ${year} a été diffusé avec succès.`}
        onClose={() => setDiffusionSuccess(false)}
      />
    </>
  );
};
