import {
  AppRouteKeys,
  AppRouteLink,
  AppRouteLinks
} from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { FunctionComponent } from 'react';
import { Navigate } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from './hooks/useAuthentication';
import { SESSION_STORAGE_REDIRECT_URL } from './views/LoginCallbackView/LoginCallbackView';

type AppRoute = AppRouteLink & {
  path: string;
  label?: string;
  key: string;
};

export const AuthenticatedAppRoutes = {
  DashboardRoute: {
    ...AppRouteLinks.DashboardRoute,
    path: '/',
    label: 'Tableau de bord',
    key: 'dashboard_route'
  },
  NotificationsRoute: {
    ...AppRouteLinks.NotificationsRoute,
    path: '/notifications',
    label: 'Notifications',
    key: 'notifications_route'
  },
  ProgrammingRoute: {
    ...AppRouteLinks.ProgrammingRoute,
    path: '/programmation',
    label: 'Programmation',
    key: 'programmation_route'
  },
  SamplesByYearRoute: {
    ...AppRouteLinks.SamplesByYearRoute,
    path: '/programmation/:year/prelevements',
    label: 'Prélèvements',
    key: 'samples_route'
  },
  NewSampleRoute: {
    ...AppRouteLinks.NewSampleRoute,
    path: '/programmation/:year/prelevements/nouveau',
    label: 'Prélèvement',
    key: 'new_sample_route'
  },
  SampleRoute: {
    ...AppRouteLinks.SampleRoute,
    path: '/prelevements/:sampleId',
    label: 'Prélèvement',
    key: 'sample_route'
  },
  SampleAnalysisEditRoute: {
    ...AppRouteLinks.SampleAnalysisEditRoute,
    path: '/prelevements/:sampleId/edit',
    label: 'Prélèvement',
    key: 'sample_analysis_edit_route'
  },
  DocumentsRoute: {
    ...AppRouteLinks.DocumentsRoute,
    path: '/documents',
    label: 'Documents ressources',
    key: 'documents_route'
  },
  NewDocumentRoute: {
    ...AppRouteLinks.NewDocumentRoute,
    path: '/documents/nouveau',
    label: 'Nouveau document ressource',
    key: 'new_document_route'
  },
  DocumentRoute: {
    ...AppRouteLinks.DocumentRoute,
    path: '/documents/:documentId',
    label: 'Document ressource',
    key: 'document_route'
  },
  ApiDocsRoute: {
    ...AppRouteLinks.ApiDocsRoute,
    path: '/api-docs',
    label: 'API Docs',
    key: 'api_docs'
  },
  LogoutCallbackRoute: {
    ...AppRouteLinks.LogoutCallbackRoute,
    path: '/logout-callback',
    key: 'logout_callback_route'
  },
  AdminRoute: {
    ...AppRouteLinks.AdminRoute,
    path: '/admin',
    key: 'admin_route'
  },
  UsersRoute: {
    ...AppRouteLinks.UsersRoute,
    path: '/utilisateurs',
    key: 'users_route'
  }
} as const satisfies Partial<Record<AppRouteKeys, AppRoute>>;

const NotAuthenticatedAppRoutes = {
  LoginRoute: {
    ...AppRouteLinks.LoginRoute,
    path: '/',
    label: 'Connexion',
    key: 'connexion_route'
  },
  LoginCallbackRoute: {
    ...AppRouteLinks.LoginCallbackRoute,
    path: '/login-callback',
    key: 'login_callback_route'
  }
} as const satisfies Partial<Record<AppRouteKeys, AppRoute>>;

export const AppRoutes = {
  ...AuthenticatedAppRoutes,
  ...NotAuthenticatedAppRoutes
};

export type AuthenticatedAppRoutes = keyof typeof AuthenticatedAppRoutes;

export const RedirectRoute: FunctionComponent = ({ ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasRole } = useAuthentication();

  if (
    window.location.pathname !== '/logout-callback' &&
    window.location.pathname !== '/'
  ) {
    sessionStorage.setItem(
      SESSION_STORAGE_REDIRECT_URL,
      window.location.pathname
    );
  }

  if (hasRole('LaboratoryUser')) {
    return <Navigate to="/documents" replace={true} />;
  }

  return <Navigate to="/" replace={true} />;
};
