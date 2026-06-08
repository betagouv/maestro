import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Brand } from 'maestro-shared/constants';
import { Regions } from 'maestro-shared/referential/Region';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import React, {
  type FunctionComponent,
  useCallback,
  useContext,
  useState
} from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import AppSearchInput from '../_app/AppSearchInput/AppSearchInput';
import { selectOptionsFromList } from '../_app/AppSelect/AppSelectOption';
import { useMascarade } from './useMascarade';

interface Props {
  modal: ReturnType<typeof createModal>;
}

export const MascaradeModal = ({ modal, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasRole } = useAuthentication();

  const { setMascaradeUserId } = useMascarade();

  const [userId, setUserId] = useState<string | null>(null);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    modal.close();
    if (userId) {
      setMascaradeUserId(userId);
    }
  };

  return (
    <>
      {hasRole('Administrator') && (
        <modal.Component
          title="Mode mascarade"
          concealingBackdrop={false}
          topAnchor
          buttons={[
            {
              children: 'Prendre sa place',
              onClick: submit,
              doClosesModal: false,
              priority: 'secondary'
            }
          ]}
        >
          Vous pouvez vous connecter à {Brand} en tant qu'un autre utilisateur.
          <Alert
            severity="warning"
            className={cx('fr-my-2w')}
            small={true}
            description="Toute modification effectuée sera automatiquement enregistrée au nom de l'utilisateur."
          />
          <UsersSearchInput setUserId={setUserId} />
        </modal.Component>
      )}{' '}
    </>
  );
};

const UsersSearchInput: FunctionComponent<{
  setUserId: (newValue: string | null) => void;
}> = ({ setUserId, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);

  const { data: users } = apiClient.useFindUsersQuery({ disabled: false });
  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({});
  const getSubPlanLabel = useCallback(
    (subPlanId: ProgrammingSubPlanId) => {
      const plan = programmingPlans?.find((p) =>
        p.subPlans.some((sp) => sp.id === subPlanId)
      );
      const subPlan = plan?.subPlans.find((sp) => sp.id === subPlanId);
      if (!subPlan) return subPlanId;
      return `${subPlan.codeNat} (${plan?.year})`;
    },
    [programmingPlans]
  );

  return (
    <>
      {users && (
        <AppSearchInput
          options={selectOptionsFromList(
            users.map(({ id }) => id),
            {
              labels: users.reduce(
                (acc, u) => {
                  let label = `${u.name ?? u.email} - ${u.roles.map((role) => UserRoleLabels[role]).join(',')}`;
                  if (u.region) {
                    label += ` - ${Regions[u.region].name}`;
                  }
                  if (u.programmingSubPlanIds.length > 0) {
                    label += ` - ${u.programmingSubPlanIds.map((_) => getSubPlanLabel(_)).join(', ')}`;
                  }
                  acc[u.id] = label;
                  return acc;
                },
                {} as Record<string, string>
              ),
              withSort: true,
              withDefault: false
            }
          )}
          label="Utilisateur"
          value={''}
          onSelect={(value) => setUserId(value ?? null)}
        />
      )}
    </>
  );
};
