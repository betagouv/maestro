import Button from '@codegouvfr/react-dsfr/Button';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import type { Company } from 'maestro-shared/schema/Company/Company';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  companiesIsRequired,
  departmentIsRequired,
  laboratoryIsRequired,
  programmingSubPlanIdsIsRequired,
  type UserRefined,
  UserToCreateRefined
} from 'maestro-shared/schema/User/User';
import {
  canHaveDepartment,
  isRegionalRole,
  UserRoleLabels,
  UserRoleList
} from 'maestro-shared/schema/User/UserRole';
import type { Nullable } from 'maestro-shared/utils/typescript';
import type React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import { AppMultiSelect } from '../../../components/_app/AppMultiSelect/AppMultiSelect';
import AppRequiredInput from '../../../components/_app/AppRequired/AppRequiredInput';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import CompanySearch from '../../../components/CompanySearch/CompanySearch';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';

interface Props {
  userToUpdate: null | UserRefined;
  modal: ReturnType<typeof createModal>;
  setAlertMessage: (message: string) => void;
  programmingPlans: ProgrammingPlanChecked[];
}

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

const userDefaultValue: Nullable<UserToCreateRefined> = {
  email: null,
  roles: [],
  programmingSubPlans: [],
  region: null,
  department: null,
  companies: [],
  laboratoryId: null,
  disabled: false
};

export const UserModal = ({
  userToUpdate,
  modal,
  setAlertMessage,
  programmingPlans,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const allSubPlans = useMemo(
    () =>
      programmingPlans.flatMap((p) =>
        p.subPlans.map((sp) => ({ ...sp, year: p.year }))
      ),
    [programmingPlans]
  );

  const [findCompanies] = apiClient.useLazyFindCompaniesQuery();

  const [createUser, createUserResult] = apiClient.useCreateUserMutation();
  const [updateUser, updateUserResult] = apiClient.useUpdateUserMutation();

  const [user, setUser] =
    useState<Nullable<UserToCreateRefined>>(userDefaultValue);

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery(
    {},
    {
      skip: !laboratoryIsRequired(user)
    }
  );

  const form = useForm(UserToCreateRefined, {
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

  useEffect(() => {
    if (
      !canHaveDepartment(user) &&
      !user.roles?.some((role) => isRegionalRole(role))
    ) {
      setUser((u) => ({ ...u, region: null }));
    }
    if (!canHaveDepartment(user)) {
      setUser((u) => ({ ...u, department: null }));
    }
  }, [user.roles, user.region]);

  const [companies, setCompanies] = useState<Company[]>([]);
  useEffect(() => {
    if (
      companiesIsRequired({
        programmingSubPlans: user.programmingSubPlans,
        roles: user.roles
      })
    ) {
      findCompanies({
        kinds: ['MEAT_SLAUGHTERHOUSE', 'POULTRY_SLAUGHTERHOUSE'],
        region: user.region ?? undefined,
        department: user.department ?? undefined
      })
        .unwrap()
        .then((data) => {
          setCompanies(data);
        });
    }
  }, [
    user.region,
    user.department,
    user.programmingSubPlans,
    user.roles,
    findCompanies
  ]);

  useIsModalOpen(modal, {
    onConceal: () => {
      form.reset();
      createUserResult.reset();
      updateUserResult.reset();
      setTimeout(() => {
        setUser(userDefaultValue);
      }, 2);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async (n) => {
      try {
        if (userToUpdate?.id) {
          await updateUser({
            ...n,
            id: userToUpdate.id,
            userId: userToUpdate.id
          }).unwrap();
          setAlertMessage(
            `L'utilisateur ${userToUpdate.name} a bien été modifié.`
          );
        } else {
          await createUser(n).unwrap();
          setAlertMessage(`L'utilisateur ${n.email} a bien été créé.`);
        }
        e.preventDefault();
        modal.close();
      } catch (_e: any) {
        /* empty */
      }
    });
  };

  return (
    <modal.Component
      title={
        !userToUpdate?.id ? 'Nouvel utilisateur' : "Modification d'utilisateur"
      }
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
      <form>
        <AppTextInput
          onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
          inputForm={form}
          inputKey="email"
          label="Courriel"
          type={'email'}
          value={user.email ?? ''}
          required
        />
        <AppMultiSelect
          inputForm={form}
          inputKey={'roles'}
          items={UserRoleList}
          onChange={(roles) =>
            setUser((u) => ({
              ...u,
              roles
            }))
          }
          values={user.roles ?? []}
          keysWithLabels={UserRoleLabels}
          defaultLabel={'rôle sélectionné'}
          label={'Rôles'}
          nativeSelectProps={{
            'data-testid': 'user-form-role-select'
          }}
          required
        />
        {(user.roles?.some((role) => isRegionalRole(role)) ||
          canHaveDepartment(user)) && (
          <AppSelect
            onChange={(e) => {
              const { data, success } = Region.safeParse(e.target.value);
              if (success) {
                setUser((u) => ({ ...u, region: data, department: null }));
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
        {user.roles && user.region && canHaveDepartment(user) && (
          <AppSelect
            onChange={(e) => {
              const { data, success } = Department.safeParse(e.target.value);
              setUser((u) => ({
                ...u,
                department: success ? data : null
              }));
            }}
            value={user.department ?? ''}
            inputForm={form}
            inputKey={'department'}
            label="Département"
            options={departmentOptions}
            required={departmentIsRequired(user)}
          />
        )}
        <AppMultiSelect
          inputForm={form}
          inputKey={'programmingSubPlans'}
          items={allSubPlans.map((sp) => sp.id)}
          onChange={(v) =>
            setUser((u) => ({
              ...u,
              programmingSubPlans: v
                .map((id) => allSubPlans.find((sp) => sp.id === id))
                .filter((sp) => sp != null)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .map(({ year: _year, ...sp }): ProgrammingSubPlan => sp)
            }))
          }
          values={user.programmingSubPlans?.map((sp) => sp.id) ?? []}
          keysWithLabels={Object.fromEntries(
            allSubPlans.map((sp) => [sp.id, `${sp.codeNat} (${sp.year})`])
          )}
          defaultLabel={'sous plan sélectionné'}
          label={'Sous-plans'}
          required={programmingSubPlanIdsIsRequired(user)}
        />

        {companiesIsRequired({
          programmingSubPlans: user.programmingSubPlans,
          roles: user.roles
        }) && (
          <CompanySearch
            label={
              <>
                Abattoirs
                <AppRequiredInput />
                {companies.length > 0 &&
                  companies.some(
                    (c) => !user.companies?.some((uc) => uc.siret === c.siret)
                  ) && (
                    <Button
                      priority="tertiary no outline"
                      size="small"
                      onClick={() =>
                        setUser((u) => ({
                          ...u,
                          companies: [
                            ...(u.companies ?? []),
                            ...companies.filter(
                              (c) =>
                                !u.companies?.some((uc) => uc.siret === c.siret)
                            )
                          ]
                        }))
                      }
                    >
                      Tout sélectionner
                    </Button>
                  )}
                {(user.companies?.length ?? 0) > 0 && (
                  <Button
                    priority="tertiary no outline"
                    size="small"
                    onClick={() => setUser((u) => ({ ...u, companies: [] }))}
                  >
                    Tout désélectionner
                  </Button>
                )}
              </>
            }
            multi={true}
            initialValue={user.companies ?? []}
            onSelect={(v) => {
              setUser((u) => ({
                ...u,
                companies: v
              }));
            }}
            state={form.messageType('companies')}
            stateRelatedMessage={
              form.message('companies') ?? 'Abattoirs correctement renseignés'
            }
            companies={companies.filter(
              (c) => !user.companies?.some((uc) => uc.siret === c.siret)
            )}
          />
        )}
        {laboratoryIsRequired(user) && (
          <AppSelect
            onChange={(e) => {
              setUser((u) => ({ ...u, laboratoryId: e.target.value }));
            }}
            value={user.laboratoryId ?? ''}
            inputForm={form}
            inputKey={'laboratoryId'}
            label="Laboratoire"
            options={selectOptionsFromList(
              laboratories?.map((lab) => lab.id) ?? [],
              {
                labels: laboratories?.reduce(
                  (acc, lab) => {
                    acc[lab.id] = lab.name;
                    return acc;
                  },
                  {} as Record<string, string>
                ),
                withSort: true
              }
            )}
            required
          />
        )}

        <AppServiceErrorAlert call={createUserResult} />
        <AppServiceErrorAlert call={updateUserResult} />
      </form>
    </modal.Component>
  );
};
