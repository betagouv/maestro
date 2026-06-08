import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Navigate, useParams } from 'react-router';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { adminSections } from './adminSections';

export const AdminView = () => {
  const { section: sectionSlug } = useParams();

  const section = adminSections.find((s) => s.slug === sectionSlug);

  useDocumentTitle(section?.label ?? 'Administration');

  if (!section) {
    return (
      <Navigate
        replace
        to={AuthenticatedAppRoutes.AdminRoute.link(adminSections[0].slug)}
      />
    );
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
        {section.content}
      </div>
    </section>
  );
};
