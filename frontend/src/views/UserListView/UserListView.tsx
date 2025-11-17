import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { User } from 'maestro-shared/schema/User/User';
import { useCallback, useContext, useState } from 'react';
import usersSvg from 'src/assets/illustrations/users.svg';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { UserCard } from './components/UserCard';
import { UserModal } from './components/UserModal';
import { FindUserOptions, UsersFilters } from './components/UsersFilters';

const userFormModal = createModal({
  id: `user-form-modale-id`,
  isOpenedByDefault: false
});

export const UserListView = () => {
  useDocumentTitle('Gestions des utilisateurs');

  const apiClient = useContext(ApiClientContext);

  const { data: users } = apiClient.useFindUsersQuery({});
  const { data: companies } = apiClient.useFindCompaniesQuery({});
  const [userToUpdate, setUserToUpdate] = useState<null | User>(null);

  const [usersFiltered, setUsersFiltered] = useState<User[]>(users ?? []);

  const onEdit = (userToEdit: User) => {
    // Déstructuration pour redéclencher le useEffect et mettre à jour le formulaire
    setUserToUpdate({ ...userToEdit });
    userFormModal.open();
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
                <UserCard user={user} onEdit={() => onEdit(user)} />
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
    </>
  );
};
