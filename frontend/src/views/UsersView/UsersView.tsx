import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import warningImg from 'src/assets/illustrations/avatar.svg';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const UsersView = () => {
  useDocumentTitle('Administrations des utilisateurs');

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Utilisateurs"
        subtitle={`Gestion des utilisateurs`}
        illustration={warningImg}
      />
      TODO
    </section>
  );
};
