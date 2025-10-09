import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useContext } from 'react';
import usersSvg from 'src/assets/illustrations/users.svg';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { UserCard } from './components/UserCard';

export const UsersView = () => {
  useDocumentTitle('Gestions des utilisateurs');

  const apiClient = useContext(ApiClientContext);

  const { data: users } = apiClient.useFindUsersQuery({});

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Utilisateurs"
        subtitle={`Gestion des utilisateurs`}
        illustration={usersSvg}
        action={
          <Button
            linkProps={{
              to: '',
              target: '_self'
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
              <UserCard user={user} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
