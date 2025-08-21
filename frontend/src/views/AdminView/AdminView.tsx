import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import warningImg from 'src/assets/illustrations/warning.svg';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AdminViewDashboardNotice } from './AdminViewDashboardNotice';
import { AdminViewRootNotice } from './AdminViewRootNotice';

export const AdminView = () => {
  useDocumentTitle('Administration');

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Administrations"
        subtitle={`Réservé aux administrateurs Maestro`}
        illustration={warningImg}
      />

      <AdminViewRootNotice />
      <AdminViewDashboardNotice />
    </section>
  );
};
