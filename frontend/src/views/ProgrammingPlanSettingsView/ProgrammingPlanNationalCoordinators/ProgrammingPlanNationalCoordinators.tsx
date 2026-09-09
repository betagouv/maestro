import { uniqBy } from 'lodash-es';
import type { ProgrammingPlanNationalCoordinator } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import type { ProgrammingLevelSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import { useContext } from 'react';
import { AppMultiSelect } from 'src/components/_app/AppMultiSelect/AppMultiSelect';
import { useAuthentication } from 'src/hooks/useAuthentication';
import type { UseForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';

type Props = {
  nationalCoordinators: ProgrammingPlanNationalCoordinator[];
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (
    nationalCoordinators: ProgrammingPlanNationalCoordinator[]
  ) => void;
};

export const ProgrammingPlanNationalCoordinators = ({
  nationalCoordinators,
  inputForm,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const { hasAccountPermission } = useAuthentication();

  const { data: users = [] } = apiClient.useFindUsersQuery({
    roles: ['NationalCoordinator'],
    disabled: false
  });

  const items = uniqBy(
    [
      ...users.map(({ id, name, email }) => ({ id, name, email })),
      ...nationalCoordinators
    ] satisfies ProgrammingPlanNationalCoordinator[],
    'id'
  );

  return (
    <AppMultiSelect
      inputForm={inputForm}
      inputKey="nationalCoordinators"
      idKey="id"
      items={items}
      values={nationalCoordinators}
      onChange={onChange}
      keysWithLabels={Object.fromEntries(
        items.map(({ id, name, email }) => [id, name ?? email])
      )}
      defaultLabel="propriétaire sélectionné"
      label="Propriétaire(s) du plan"
      disabled={
        !hasAccountPermission('manageProgrammingPlanNationalCoordinators')
      }
      required
    />
  );
};
