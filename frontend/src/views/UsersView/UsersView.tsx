import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { User } from 'maestro-shared/schema/User/User';
import { useContext, useState } from 'react';
import usersSvg from 'src/assets/illustrations/users.svg';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { UserCard } from './components/UserCard';
import { UserModal } from './components/UserModal';

const userFormModal = createModal({
  id: `user-form-modale-id`,
  isOpenedByDefault: false
});

export const UsersView = () => {
  useDocumentTitle('Gestions des utilisateurs');

  const apiClient = useContext(ApiClientContext);

  const { data: users } = apiClient.useFindUsersQuery({});
  const [userToUpdate, setUserToUpdate] = useState<null | User>(null);

  const onEdit = (userToEdit: User) => {
    setUserToUpdate(userToEdit);
    userFormModal.open();
  };

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

        <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
          <div className="d-flex-align-start"></div>
        </div>

        <div
          className={clsx(
            'white-container',
            cx('fr-px-2w', 'fr-px-md-5w', 'fr-py-2w', 'fr-py-md-5w')
          )}
        >
          <div
            className={clsx(cx('fr-mb-2w', 'fr-mb-md-5w'), 'table-header')}
          ></div>

          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {users?.map((user) => (
              <div className={cx('fr-col-12', 'fr-col-md-4')} key={user.id}>
                <UserCard user={user} onEdit={() => onEdit(user)} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <UserModal modal={userFormModal} userToUpdate={userToUpdate} />
    </>
  );
};
