export type AppRouteLink = {
  link: string | ((param: string) => string) | ((param: number) => string);
};

export const AppRouteLinks = {
  DashboardRoute: {
    link: '/'
  },
  NotificationsRoute: {
    link: '/notifications'
  },
  ProgrammingRoute: {
    link: `/programmation`
  },
  SamplesByYearRoute: {
    link: (year: number) => `/programmation/${year}/prelevements`
  },
  NewSampleRoute: {
    link: (year: number) => `/programmation/${year}/prelevements/nouveau`
  },
  SampleRoute: {
    link: (sampleId: string) => `/prelevements/${sampleId}`
  },
  DocumentsRoute: {
    link: '/documents'
  },
  ApiDocsRoute: {
    link: '/api-docs'
  },
  LoginRoute: {
    link: '/'
  },
  LoginCallbackRoute: {
    link: '/login-callback'
  },
  LogoutCallbackRoute: {
    link: '/logout-callback'
  },
  AdminRoute: {
    link: '/admin'
  }
} as const satisfies Record<string, AppRouteLink>;

export type AppRouteKeys = keyof typeof AppRouteLinks;
