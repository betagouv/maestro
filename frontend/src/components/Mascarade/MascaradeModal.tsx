import { createModal } from '@codegouvfr/react-dsfr/Modal';
import React, { FunctionComponent, useContext, useState } from 'react';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Brand } from 'maestro-shared/constants';
import { assert, type Equals } from 'tsafe';
import { MascaradeContext } from './MascaradeContext';
import { useFindUsersQuery } from '../../services/user.service';
import AppSearchInput from '../_app/AppSearchInput/AppSearchInput';
import { selectOptionsFromList } from '../_app/AppSelect/AppSelectOption';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';

interface Props {
  modal: ReturnType<typeof createModal>
}

export const MascaradeModal = ({ modal, ..._rest }: Props) => {

  assert<Equals<keyof typeof _rest, never>>();

  const { setMascaradeUserId } = useContext(MascaradeContext);


  const [userId, setUserId] = useState<string | null>(null)

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    modal.close();
    setMascaradeUserId(userId)
  };

  return (
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

      <UsersSearchInput setUserId={setUserId}/>
    </modal.Component>
  );
};

const UsersSearchInput: FunctionComponent<{
  setUserId: (newValue: string | null) => void;
}> = ({ setUserId, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { data: users } = useFindUsersQuery({});

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
                  acc[u.id] = `${u.firstName} ${u.lastName}`;
                  return acc;
                },
                {} as Record<string, string>
              ),
              withSort: true,
              withDefault: false
            }
          )}
          label='Utilisateur'
          value={''}
          onSelect={(value) => setUserId(value ?? null)}
        />
      )}
    </>
  );
};
