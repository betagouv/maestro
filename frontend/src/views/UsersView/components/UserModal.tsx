import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { hasNationalRole, UserToCreate } from 'maestro-shared/schema/User/User';
import { UserRole, UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { Nullable } from 'maestro-shared/utils/typescript';
import React, { useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';
interface Props {
  modal: ReturnType<typeof createModal>;
}

const userRoleOptions = selectOptionsFromList(UserRole.options, {
  labels: UserRoleLabels,
  withSort: true
});

const regionOptions = selectOptionsFromList(RegionList, {
  labels: RegionList.reduce(
    (acc, r) => {
      acc[r] = Regions[r].name;
      return acc;
    },
    {} as Record<string, string>
  ),
  withSort: true
});

export const UserModal = ({ modal, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [createUser] = apiClient.useCreateUserMutation();

  const [user, setUser] = useState<Nullable<UserToCreate>>({
    email: null,
    role: null,
    programmingPlanKinds: ['PPV'],
    region: null
  });

  const form = useForm(UserToCreate, user);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    form.validate(async (n) => {
      await createUser(n);
      e.preventDefault();
      modal.close();
    });
  };

  return (
    <modal.Component
      title="Nouvel utilisateur"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Enregistrer',
          onClick: submit,
          doClosesModal: false,
          priority: 'primary'
        }
      ]}
    >
      <form className={clsx('bg-white', cx('fr-p-2w'))}>
        <AppTextInput
          onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
          inputForm={form}
          inputKey="email"
          label="Courriel"
          type={'email'}
          required
        />
        <AppSelect
          onChange={(e) => {
            const { data, success } = UserRole.nullable().safeParse(
              e.target.value === '' ? null : e.target.value
            );
            if (success) {
              setUser((u) => ({ ...u, role: data }));
              if (data === null || hasNationalRole({ role: data })) {
                setUser((u) => ({ ...u, region: null }));
              }
            }
          }}
          inputForm={form}
          inputKey={'role'}
          label="Rôle"
          options={userRoleOptions}
          required
        />
        {user.role && !hasNationalRole(user) && (
          <AppSelect
            onChange={(e) => {
              const { data, success } = Region.safeParse(e.target.value);
              if (success) {
                setUser((u) => ({ ...u, region: data }));
              }
            }}
            inputForm={form}
            inputKey={'region'}
            label="Région"
            options={regionOptions}
            required
          />
        )}

        {/*  //FIXME PROGRAMMING PLAN KIND select multiple*/}
      </form>
    </modal.Component>
  );
};
