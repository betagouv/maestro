import { AppRouteKeys } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { ReactElement } from 'react';
import YearRoute from './components/YearRoute/YearRoute';
import { AdminView } from './views/AdminView/AdminView';
import DashboardView from './views/DashboardView/DashboardView';
import DocumentListView from './views/DocumentListView/DocumentListView';
import HomeView from './views/HomeView/HomeView';
import { LoginCallbackView } from './views/LoginCallbackView/LoginCallbackView';
import { LogoutCallbackView } from './views/LogoutCallbackView/LogoutCallbackView';
import NotificationsView from './views/NotificationsView/NotificationsView';
import { OpenApiExplorerView } from './views/OpenApiExplorer/OpenApiExplorerView';
import ProgrammingPlanView from './views/ProgrammingPlanView/ProgrammingPlanView';
import SampleListView from './views/SampleListView/SampleListView';
import SampleView from './views/SampleView/SampleView';
import { UserListView } from './views/UserListView/UserListView';

export const AppRouteComponents = {
  DashboardRoute: DashboardView,
  NotificationsRoute: NotificationsView,
  ProgrammationByYearRoute: () => <YearRoute element={ProgrammingPlanView} />,
  SamplesByYearRoute: () => <YearRoute element={SampleListView} />,
  NewSampleRoute: () => <YearRoute element={SampleView} />,
  SampleRoute: SampleView,
  DocumentsRoute: DocumentListView,
  ApiDocsRoute: OpenApiExplorerView,
  LogoutCallbackRoute: LogoutCallbackView,
  LoginRoute: HomeView,
  LoginCallbackRoute: LoginCallbackView,
  AdminRoute: AdminView,
  UsersRoute: UserListView
} as const satisfies Record<AppRouteKeys, () => ReactElement>;
