import {
  AppRouteKeys,
  AppRouteLink,
  AppRouteLinks
} from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { ReactElement } from 'react';
import YearRoute from './components/YearRoute/YearRoute';
import DashboardView from './views/DashboardView/DashboardView';
import DocumentListView from './views/DocumentListView/DocumentListView';
import HomeView from './views/HomeView/HomeView';
import LoginCallbackView from './views/LoginCallbackView/LoginCallbackView';
import LogoutCallbackView from './views/LogoutCallbackView/LogoutCallbackView';
import NotificationsView from './views/NotificationsView/NotificationsView';
import { OpenApiExplorerView } from './views/OpenApiExplorer/OpenApiExplorerView';
import ProgrammingPlanView from './views/ProgrammingPlanView/ProgrammingPlanView';
import SampleListView from './views/SampleListView/SampleListView';
import SampleView from './views/SampleView/SampleView';

type AppRoute = AppRouteLink & {
  path: string;
  label?: string;
  key: string;
  component: () => ReactElement;
};

export const AuthenticatedAppRoutes = {
  DashboardRoute: {
    ...AppRouteLinks.DocumentsRoute,
    path: '/',
    label: 'Tableau de bord',
    key: 'dashboard_route',
    component: DashboardView
  },
  NotificationsRoute: {
    ...AppRouteLinks.NotificationsRoute,
    path: '/notifications',
    label: 'Notifications',
    key: 'notifications_route',
    component: NotificationsView
  },
  ProgrammationByYearRoute: {
    ...AppRouteLinks.ProgrammationByYearRoute,
    path: '/programmation/:year',
    label: 'Programmation',
    key: 'programmation_route',
    component: () => <YearRoute element={ProgrammingPlanView} />
  },
  SamplesByYearRoute: {
    ...AppRouteLinks.SamplesByYearRoute,
    path: '/programmation/:year/prelevements',
    label: 'Prélèvements',
    key: 'samples_route',
    component: () => <YearRoute element={SampleListView} />
  },
  NewSampleRoute: {
    ...AppRouteLinks.NewSampleRoute,
    path: '/programmation/:year/prelevements/nouveau',
    label: 'Prélèvement',
    key: 'new_sample_route',
    component: () => <YearRoute element={SampleView} />
  },
  SampleRoute: {
    ...AppRouteLinks.SampleRoute,
    path: '/prelevements/:sampleId',
    label: 'Prélèvement',
    key: 'sample_route',
    component: SampleView
  },
  DocumentsRoute: {
    ...AppRouteLinks.DocumentsRoute,
    path: '/documents',
    label: 'Documents ressources',
    key: 'documents_route',
    component: DocumentListView
  },
  ApiDocsRoute: {
    ...AppRouteLinks.ApiDocsRoute,
    path: '/api-docs',
    label: 'API Docs',
    key: 'api_docs',
    component: OpenApiExplorerView
  },
  LogoutCallbackRoute: {
    ...AppRouteLinks.LogoutCallbackRoute,
    path: '/logout-callback',
    key: 'logout_callback_route',
    component: LogoutCallbackView
  }
} as const satisfies Partial<Record<AppRouteKeys, AppRoute>>;

export const NotAuthenticatedAppRoutes = {
  LoginRoute: {
    ...AppRouteLinks.LoginRoute,
    path: '/',
    label: 'Connexion',
    key: 'connexion_route',
    component: HomeView
  },
  LoginCallbackRoute: {
    ...AppRouteLinks.LoginCallbackRoute,
    path: '/login-callback',
    key: 'login_callback_route',
    component: LoginCallbackView
  }
} as const satisfies Record<string, AppRoute>;

export type AuthenticatedAppRoutes = keyof typeof AuthenticatedAppRoutes;
export type NotAuthenticatedAppRoutes = keyof typeof NotAuthenticatedAppRoutes;
