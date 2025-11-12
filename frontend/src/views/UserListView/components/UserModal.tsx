import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import clsx from 'clsx';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { User, UserToCreate } from 'maestro-shared/schema/User/User';
import {
  hasDepartmentalRole,
  hasNationalRole,
  hasRegionalRole,
  UserRole,
  UserRoleLabels
} from 'maestro-shared/schema/User/UserRole';
import { Nullable } from 'maestro-shared/utils/typescript';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';

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

const userDefaultValue: Nullable<UserToCreate> = {
  email: null,
  role: null,
  programmingPlanKinds: ['PPV'],
  region: null,
  department: null
};

export const UserModal = ({ userToUpdate, modal, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [createUser] = apiClient.useCreateUserMutation();
  const [updateUser] = apiClient.useUpdateUserMutation();

  const [user, setUser] = useState<Nullable<UserToCreate>>(userDefaultValue);

  const form = useForm(UserToCreate, {
    ...user
  });

  const departmentOptions = useMemo(() => {
    if (!user.region) {
      return [];
    }

    return selectOptionsFromList(Regions[user.region].departments, {
      labels: DepartmentLabels,
      withSort: true
    });
  }, [user.region]);

  useEffect(() => {
    if (userToUpdate) {
      const { id, name, ...rest } = userToUpdate;
      setUser(rest);
    }
  }, [userToUpdate]);

  useIsModalOpen(modal, {
    onConceal: () => {
      form.reset();
      setTimeout(() => {
        setUser(userDefaultValue);
      }, 2);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async (n) => {
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
      <form
        className={clsx('bg-white', cx('fr-p-2w'))}
        data-testid={'user-edit-modal-form'}
      >
        <AppTextInput
          onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
          inputForm={form}
          inputKey="email"
          label="Courriel"
          type={'email'}
          value={user.email ?? ''}
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
          value={user.role ?? ''}
          inputForm={form}
          inputKey={'role'}
          label="Rôle"
          options={userRoleOptions}
          nativeSelectProps={{
            'data-testid': 'user-form-role-select'
          }}
          required
        />
        {user.role && (hasRegionalRole(user) || hasDepartmentalRole(user)) && (
          <AppSelect
            onChange={(e) => {
              const { data, success } = Region.safeParse(e.target.value);
              if (success) {
                setUser((u) => ({ ...u, region: data }));
              }
            }}
            value={user.region ?? ''}
            inputForm={form}
            inputKey={'region'}
            label="Région"
            options={regionOptions}
            required
          />
        )}
        {user.role && hasDepartmentalRole(user) && (
          <AppSelect
            onChange={(e) => {
              const { data, success } = Department.safeParse(e.target.value);
              if (success) {
                setUser((u) => ({ ...u, department: data }));
              }
            }}
            value={user.department ?? ''}
            inputForm={form}
            inputKey={'department'}
            label="Département"
            options={departmentOptions}
            required
          />
        )}

        {/*  //TODO PROGRAMMING PLAN KIND select multiple, à récupérer sur la branche DAOA*/}
      </form>
    </modal.Component>
  );
};
