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
  ProgrammingByYearRoute: {
    link: (year: number) => `/programmation/${year}`
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
  SampleAnalysisEditRoute: {
    link: (sampleId: string) => `/prelevements/${sampleId}/edit`
  },
  NewDocumentRoute: {
    link: '/documents/nouveau'
  },
  DocumentRoute: {
    link: (documentId: string) => `/documents/${documentId}`
  },
  DocumentsRoute: {
    link: '/documents'
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
  },
  UsersRoute: {
    link: '/utilisateurs'
  },
  LaboratoryAnalyticalCompetencesRoute: {
    link: '/competences-analytiques'
  },
  LaboratoryAgreementsRoute: {
    link: '/laboratoires/agrements'
  }
} as const satisfies Record<string, AppRouteLink>;

export type AppRouteKeys = keyof typeof AppRouteLinks;
