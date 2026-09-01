import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { useContext } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import { AddFieldToProgrammingSubPlanModal } from './AddFieldToProgrammingSubPlanModal';
import { ProgrammingSubPlanFieldList } from './ProgrammingSubPlanFieldList';

const addFieldModal = createModal({
  id: 'sampler-form-add-field-modal',
  isOpenedByDefault: false
});

type Props = {
  programmingPlanId: string;
  programmingSubPlanId: ProgrammingSubPlanId;
};

export const ProgrammingPlanSamplerFormSettings = ({
  programmingPlanId,
  programmingSubPlanId,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const { data: programmingSubPlanFields = [], isLoading: isLoadingFields } =
    apiClient.useFindProgrammingSubPlanFieldConfigsQuery({
      programmingPlanId,
      programmingSubPlanId
    });

  const { data: allFields = [] } = apiClient.useFindAllFieldConfigsQuery();

  return (
    <>
      <div
        className={clsx('d-flex-row', 'd-flex-align-center', cx('fr-mb-2w'))}
      >
        <h5 className={cx('fr-mb-0')}>Champs actifs</h5>
        <Button
          className={cx('fr-ml-auto')}
          iconId="fr-icon-add-line"
          onClick={() => addFieldModal.open()}
          disabled={
            allFields.filter(
              (f) =>
                !programmingSubPlanFields.some((pkf) => pkf.field.key === f.key)
            ).length === 0
          }
        >
          Ajouter un champ
        </Button>
      </div>

      {isLoadingFields ? (
        <p>Chargement…</p>
      ) : (
        <ProgrammingSubPlanFieldList
          programmingPlanId={programmingPlanId}
          programmingSubPlanId={programmingSubPlanId}
          programmingSubPlanFields={programmingSubPlanFields}
          allFields={allFields}
        />
      )}

      <AddFieldToProgrammingSubPlanModal
        modal={addFieldModal}
        programmingPlanId={programmingPlanId}
        programmingSubPlanId={programmingSubPlanId}
        allFields={allFields}
        activeFields={programmingSubPlanFields}
      />
    </>
  );
};
