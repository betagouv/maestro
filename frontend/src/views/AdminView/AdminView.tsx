import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { useAuthentication } from '../../hooks/useAuthentication';
import { adminSections } from './adminSections';

export const AdminView = () => {
  const { section: sectionSlug } = useParams();
  const { hasUserPermission } = useAuthentication();

  const authorizedSections = useMemo(
    () => adminSections.filter((s) => hasUserPermission(s.permission)),
    [hasUserPermission]
  );

  const section = authorizedSections.find((s) => s.slug === sectionSlug);

  useDocumentTitle(section?.label ?? 'Administration');

  if (!section) {
    return authorizedSections.length > 0 ? (
      <Navigate
        replace
        to={AuthenticatedAppRoutes.AdminRoute.link(authorizedSections[0].slug)}
      />
    ) : null;
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
        {section.content}
      </div>
    </section>
  );
};
