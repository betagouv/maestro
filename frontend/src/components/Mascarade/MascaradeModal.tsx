import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Brand } from 'maestro-shared/constants';
import { Regions } from 'maestro-shared/referential/Region';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import React, { FunctionComponent, useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import AppSearchInput from '../_app/AppSearchInput/AppSearchInput';
import { selectOptionsFromList } from '../_app/AppSelect/AppSelectOption';
import { MascaradeContext } from './MascaradeContext';

interface Props {
  modal: ReturnType<typeof createModal>;
}

export const MascaradeModal = ({ modal, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasRole } = useAuthentication();

  const { setMascaradeUserId } = useContext(MascaradeContext);

  const [userId, setUserId] = useState<string | null>(null);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    modal.close();
    setMascaradeUserId(userId);
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

  const { data: users } = apiClient.useFindUsersQuery({});

  return (
    <>
      {users && (
        <AppSearchInput
          options={selectOptionsFromList(
            users
              .filter(({ firstName }) => firstName !== '-')
              .map(({ id }) => id),
            {
              labels: users.reduce(
                (acc, u) => {
                  let label = `${u.firstName} ${u.lastName} - ${UserRoleLabels[u.role]}`;
                  if (u.region) {
                    label += ` - ${Regions[u.region].name}`;
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
