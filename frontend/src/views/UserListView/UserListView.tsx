import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Brand } from 'maestro-shared/constants';
import { User } from 'maestro-shared/schema/User/User';
import { useCallback, useContext, useState } from 'react';
import usersSvg from 'src/assets/illustrations/users.svg';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { UserCard } from './components/UserCard';
import { UserModal } from './components/UserModal';
import { FindUserOptions, UsersFilters } from './components/UsersFilters';

const userFormModal = createModal({
  id: `user-form-modale-id`,
  isOpenedByDefault: false
});

const confirmDisabingUserModal = createModal({
  id: `user-confirm-disabling-modale-id`,
  isOpenedByDefault: false
});

export const UserListView = () => {
  useDocumentTitle('Gestions des utilisateurs');

  const apiClient = useContext(ApiClientContext);
  const { user } = useAuthentication();

  const { data: users } = apiClient.useFindUsersQuery({ disabled: false });
  const [updateUser] = apiClient.useUpdateUserMutation();
  const { data: companies } = apiClient.useFindCompaniesQuery({
    kinds: ['MEAT_SLAUGHTERHOUSE', 'POULTRY_SLAUGHTERHOUSE'],
    region: user?.region ?? undefined,
    department: user?.department ?? undefined
  });

  const [userToUpdate, setUserToUpdate] = useState<null | User>(null);
  const [userToDisable, setUserToDisable] = useState<null | User>(null);

  const [usersFiltered, setUsersFiltered] = useState<User[]>(users ?? []);

  const onEdit = async (userToEdit: User) => {
    setUserToUpdate({ ...userToEdit });
    userFormModal.open();
  };

  const onDisable = (userToDisable: User) => {
    setUserToDisable(userToDisable);
    confirmDisabingUserModal.open();
  };

  const onConfirmDisable = async () => {
    if (userToDisable) {
      await updateUser({ ...userToDisable, disabled: true });
      setUserToDisable(null);
    }
  };

  const updateUsersFiltered = useCallback(
    (filters: FindUserOptions) => {
      setUsersFiltered(
        (users ?? []).filter((u) => {
          if (
            filters.label &&
            filters.label !== '' &&
            !u.name?.toLowerCase().includes(filters.label) &&
            !u.email.toLowerCase().includes(filters.label)
          ) {
            return false;
          }

          if (filters.region && u.region !== filters.region) {
            return false;
          }

          if (filters.department && u.department !== filters.department) {
            return false;
          }

          if (filters.role && u.role !== filters.role) {
            return false;
          }

          if (
            filters.programmingPlanKind &&
            !u.programmingPlanKinds.includes(filters.programmingPlanKind)
          ) {
            return false;
          }

          return true;
        })
      );
    },
    [users]
  );

  return (
    <>
      <section className={clsx(cx('fr-container'), 'main-section')}>
        <SectionHeader
          title="Utilisateurs"
          subtitle={`Gestion des utilisateurs`}
          illustration={usersSvg}
          action={
            <Button
              onClick={() => {
                setUserToUpdate(null);
                userFormModal.open();
              }}
              iconId="fr-icon-microscope-line"
            >
              Ajouter un utilisateur
            </Button>
          }
        />

        <UsersFilters onChange={updateUsersFiltered} />

        <div
          className={clsx(
            'white-container',
            cx('fr-px-2w', 'fr-px-md-5w', 'fr-py-2w', 'fr-py-md-5w')
          )}
        >
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {usersFiltered.map((user) => (
              <div className={cx('fr-col-12', 'fr-col-md-4')} key={user.id}>
                <UserCard
                  user={user}
                  onEdit={() => onEdit(user)}
                  onDisable={() => onDisable(user)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <UserModal
        modal={userFormModal}
        userToUpdate={userToUpdate}
        companies={companies ?? []}
      />
      <ConfirmationModal
        modal={confirmDisabingUserModal}
        title="Veuillez confirmer cette action"
        onConfirm={() => onConfirmDisable()}
        closeOnConfirm
      >
        Vous êtes sur le point de désactiver l'utilisateur{' '}
        <b>{userToDisable?.name}</b>, celui-ci n'aura plus accès à {Brand}.
      </ConfirmationModal>
    </>
  );
};
