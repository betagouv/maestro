import { AppRouteKeys } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { ReactElement } from 'react';
import { AdminView } from './views/AdminView/AdminView';
import DashboardView from './views/DashboardView/DashboardView';
import DocumentListView from './views/DocumentListView/DocumentListView';
import DocumentView from './views/DocumentView/DocumentView';
import HomeView from './views/HomeView/HomeView';
import { LoginCallbackView } from './views/LoginCallbackView/LoginCallbackView';
import { LogoutCallbackView } from './views/LogoutCallbackView/LogoutCallbackView';
import NotificationsView from './views/NotificationsView/NotificationsView';
import ProgrammingView from './views/ProgrammingView/ProgrammingView';
import SampleListView from './views/SampleListView/SampleListView';
import SampleView from './views/SampleView/SampleView';
import { UserListView } from './views/UserListView/UserListView';

export const AppRouteComponents = {
  DashboardRoute: DashboardView,
  NotificationsRoute: NotificationsView,
  ProgrammingRoute: ProgrammingView,
  SamplesByYearRoute: SampleListView,
  NewSampleRoute: SampleView,
  SampleRoute: SampleView,
  SampleAnalysisEditRoute: SampleView,
  DocumentsRoute: DocumentListView,
  DocumentRoute: DocumentView,
  NewDocumentRoute: DocumentView,
  LogoutCallbackRoute: LogoutCallbackView,
  LoginRoute: HomeView,
  LoginCallbackRoute: LoginCallbackView,
  AdminRoute: AdminView,
  UsersRoute: UserListView
} as const satisfies Record<AppRouteKeys, () => ReactElement>;
