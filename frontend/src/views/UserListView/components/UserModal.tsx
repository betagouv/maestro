import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { User, UserToCreate } from 'maestro-shared/schema/User/User';
import {
  hasNationalRole,
  UserRole,
  UserRoleLabels
} from 'maestro-shared/schema/User/UserRole';
import { Nullable } from 'maestro-shared/utils/typescript';
import React, { useContext, useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';
import {
  ProgrammingPlanKind, ProgrammingPlanKindLabels,
  ProgrammingPlanKindList
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';

interface Props {
  userToUpdate: null | User;
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

export const UserModal = ({ userToUpdate, modal, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [createUser] = apiClient.useCreateUserMutation();
  const [updateUser] = apiClient.useUpdateUserMutation();

  const [user, setUser] = useState<Nullable<UserToCreate>>({
    email: null,
    role: null,
    programmingPlanKinds: ['PPV'],
    region: null
  });

  useEffect(() => {
    setUser(
      userToUpdate ?? {
        email: null,
        role: null,
        programmingPlanKinds: ['PPV'],
        region: null
      }
    );
  }, [userToUpdate]);

  const form = useForm(UserToCreate, user);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    form.validate(async (n) => {
      if (userToUpdate?.id) {
        await updateUser({ ...n, id: userToUpdate.id });
      } else {
        await createUser(n);
      }
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
          value={user.email ?? undefined}
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
          value={user.role ?? undefined}
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
            value={user.region ?? undefined}
            inputForm={form}
            inputKey={'region'}
            label="Région"
            options={regionOptions}
            required
          />
        )}

        {/*  //TODO PROGRAMMING PLAN KIND select multiple, à récupérer sur la branche DAOA*/}
      </form>
    </modal.Component>
  );
};
