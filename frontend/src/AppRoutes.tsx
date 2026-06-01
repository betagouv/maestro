import {
  type AppRouteKeys,
  AppRouteLinks
} from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type { FunctionComponent } from 'react';
import { Navigate } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from './hooks/useAuthentication';
import { SESSION_STORAGE_REDIRECT_URL } from './views/LoginCallbackView/LoginCallbackView';

type AppRoute = {
  label?: string;
  key: string;
};

export const AuthenticatedAppRoutes = {
  DashboardRoute: {
    ...AppRouteLinks.DashboardRoute,
    label: 'Tableau de bord',
    key: 'dashboard_route'
  },
  NotificationsRoute: {
    ...AppRouteLinks.NotificationsRoute,
    label: 'Notifications',
    key: 'notifications_route'
  },
  ProgrammingRoute: {
    ...AppRouteLinks.ProgrammingRoute,
    label: 'Programmation',
    key: 'programmation_route'
  },
  ProgrammingByYearRoute: {
    ...AppRouteLinks.ProgrammingByYearRoute,
    label: 'Programmation',
    key: 'programmation_route'
  },
  SamplesByYearRoute: {
    ...AppRouteLinks.SamplesByYearRoute,
    label: 'Prélèvements',
    key: 'samples_route'
  },
  NewSampleRoute: {
    ...AppRouteLinks.NewSampleRoute,
    label: 'Prélèvement',
    key: 'new_sample_route'
  },
  SampleRoute: {
    ...AppRouteLinks.SampleRoute,
    label: 'Prélèvement',
    key: 'sample_route'
  },
  SampleAnalysisEditRoute: {
    ...AppRouteLinks.SampleAnalysisEditRoute,
    label: 'Prélèvement',
    key: 'sample_analysis_edit_route'
  },
  DocumentsRoute: {
    ...AppRouteLinks.DocumentsRoute,
    label: 'Documents ressources',
    key: 'documents_route'
  },
  NewDocumentRoute: {
    ...AppRouteLinks.NewDocumentRoute,
    label: 'Nouveau document ressource',
    key: 'new_document_route'
  },
  DocumentRoute: {
    ...AppRouteLinks.DocumentRoute,
    label: 'Document ressource',
    key: 'document_route'
  },
  LogoutCallbackRoute: {
    ...AppRouteLinks.LogoutCallbackRoute,
    key: 'logout_callback_route'
  },
  AdminRoute: {
    ...AppRouteLinks.AdminRoute,
    key: 'admin_route'
  },
  UsersRoute: {
    ...AppRouteLinks.UsersRoute,
    key: 'users_route'
  },
  LaboratoryAnalyticalCompetencesRoute: {
    ...AppRouteLinks.LaboratoryAnalyticalCompetencesRoute,
    label: 'Compétences analytiques',
    key: 'laboratory_analytical_competences_route'
  }
} as const satisfies Partial<Record<AppRouteKeys, AppRoute>>;

const NotAuthenticatedAppRoutes = {
  LoginRoute: {
    ...AppRouteLinks.LoginRoute,
    label: 'Connexion',
    key: 'connexion_route'
  },
  LoginCallbackRoute: {
    ...AppRouteLinks.LoginCallbackRoute,
    key: 'login_callback_route'
  }
} as const satisfies Partial<Record<AppRouteKeys, AppRoute>>;

export const AppRoutes = {
  ...AuthenticatedAppRoutes,
  ...NotAuthenticatedAppRoutes
} as const satisfies Record<AppRouteKeys, AppRoute>;

export type AuthenticatedAppRoutes = keyof typeof AuthenticatedAppRoutes;

export type AppRoutePath =
  (typeof AuthenticatedAppRoutes)[AuthenticatedAppRoutes]['path'];

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
