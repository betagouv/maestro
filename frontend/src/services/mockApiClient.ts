import {
  TypedUseLazyQuery,
  TypedUseMutation,
  TypedUseQuery
} from '@reduxjs/toolkit/query/react';
import { CommemoratifSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { UserRefined } from 'maestro-shared/schema/User/User';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import {
  SlaughterhouseCompanyFixture1,
  SlaughterhouseCompanyFixture2
} from 'maestro-shared/test/companyFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { genLocalPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  Sample11Fixture
} from 'maestro-shared/test/sampleFixtures';
import {
  DepartmentalCoordinator,
  genUser,
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture,
  Sampler2Fixture
} from 'maestro-shared/test/userFixtures';
import { fn } from 'storybook/test';
import regionsJson from '../../../server/data/regions.json';
import { ApiClient } from './apiClient';

type MockableApiKeys = Exclude<
  keyof ApiClient,
  | 'getPrescriptionsExportURL'
  | 'getSupportDocumentURL'
  | 'getSampleListExportURL'
  | 'getLaboratoryAnalyticCompetencesExportURL'
>;
export type MockApi = {
  [Key in MockableApiKeys]: ApiClient[Key] extends TypedUseQuery<
    infer D,
    any,
    any
  >
    ? { data: D } | ((arg: any) => { data: D })
    : ApiClient[Key] extends TypedUseLazyQuery<infer E, any, any>
      ? [E, { isSuccess?: boolean; isLoading?: boolean; isError?: boolean }]
      : ApiClient[Key] extends TypedUseMutation<any, any, any>
        ? [
            () => Promise<unknown>,
            { isSuccess?: boolean; isLoading?: boolean; isError?: boolean }
          ]
        : null;
};

export const getMockApi = (partialMock: Partial<MockApi>): ApiClient => {
  const mockApi = {
    ...defaultMockApiClientConf,
    ...partialMock
  };

  return Object.keys(mockApi).reduce((acc, key) => {
    if (
      key.startsWith('useGet') ||
      key.startsWith('useFind') ||
      key.startsWith('useCount')
    ) {
      // @ts-expect-error TS7053
      acc[key] = (arg?: any) => {
        // @ts-expect-error TS7053
        const value = mockApi[key];
        return typeof value === 'function' ? value(arg) : value;
      };
    } else if (
      key.startsWith('useLazyGet') ||
      key.startsWith('useLazyFind') ||
      key.startsWith('useLazySearch')
    ) {
      // @ts-expect-error TS7053
      acc[key] = () => [
        (arg?: any) => ({
          unwrap: async () => {
            // @ts-expect-error TS7053
            const value = mockApi[key][0];
            return typeof value === 'function' ? value(arg) : value;
          }
        }),
        // @ts-expect-error TS7053
        mockApi[key][1]
      ];
    } else if (
      key.startsWith('useAdd') ||
      key.startsWith('useCreate') ||
      key.startsWith('useComment') ||
      key.startsWith('useUpdate') ||
      key.startsWith('useDelete') ||
      key.startsWith('useMascarade')
    ) {
      // @ts-expect-error TS7053
      acc[key] = () => [
        (arg?: any) => {
          // @ts-expect-error TS7053
          const fn = mockApi[key][0];
          const result = typeof fn === 'function' ? fn(arg) : fn;
          return {
            unwrap: async () => result
          };
        },
        // @ts-expect-error TS7053
        { ...mockApi[key][1], reset: fn }
      ];
    }
    return acc;
  }, {} as ApiClient);
};
const defaultMockApiClientConf: MockApi = {
  useAddPrescriptionMutation: [fn(), {}],
  useAuthenticateMutation: [fn(), {}],
  useCommentLocalPrescriptionMutation: [fn(), {}],
  useCountSamplesQuery: {
    data: 0
  },
  useCreateAnalysisMutation: [fn(), {}],
  useCreateAnalysisReportDocumentMutation: [fn(), {}],
  useCreateDocumentMutation: [fn(), {}],
  useCreateLaboratoryAnalyticalCompetenceMutation: [fn(), {}],
  useCreateOrUpdateSampleMutation: [fn(), { isLoading: false }],
  useCreateProgrammingPlanMutation: [fn(), {}],
  useDeleteAnalysisReportDocumentMutation: [fn(), {}],
  useDeleteDocumentMutation: [fn(), {}],
  useDeletePrescriptionMutation: [fn(), {}],
  useDeleteSampleMutation: [fn(), {}],
  useFindCompaniesQuery: {
    data: [SlaughterhouseCompanyFixture1, SlaughterhouseCompanyFixture2]
  },
  useFindLaboratoriesQuery: { data: [] },
  useFindNotificationsQuery: { data: [] },
  useFindPrescriptionsQuery: { data: [] },
  useFindProgrammingPlansQuery: { data: [] },
  useFindLocalPrescriptionsQuery: { data: [] },
  useFindResourcesQuery: { data: [] },
  useFindSamplesQuery: { data: [] },
  useFindUsersQuery: { data: [] },
  useGetAnalysisReportDocumentIdsQuery: { data: ['fakeDocumentId'] },
  useGetAuthRedirectUrlQuery: {
    data: {
      url: ''
    }
  },
  useGetDocumentDownloadSignedUrlQuery: { data: '' },
  useGetDocumentQuery: {
    data: genDocument({
      createdAt: new Date(12345),
      createdBy: 'Storybook',
      kind: 'AnalysisRequestDocument',
      filename: 'analyses.pdf'
    })
  },
  useGetLaboratoryQuery: {
    data: LaboratoryFixture
  },
  useGetLocalPrescriptionQuery: { data: genLocalPrescription() },
  useGetLaboratoryAnalyticalCompetencesQuery: { data: [] },
  useGetPrescriptionSubstancesQuery: { data: [] },
  useGetProgrammingPlanQuery: { data: genProgrammingPlan() },
  useGetRegionsGeoJsonQuery: {
    data: JSON.parse(JSON.stringify(regionsJson))
  },
  useGetSampleAnalysisQuery: {
    data: genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sampler1Fixture.id,
      status: 'Residues'
    })
  },
  useGetSampleQuery: {
    data: genCreatedPartialSample()
  },
  useGetUserQuery: (id: string) => ({
    data: ([
      Sampler1Fixture,
      Sample11Fixture,
      Sampler2Fixture,
      NationalCoordinator,
      RegionalCoordinator,
      DepartmentalCoordinator
    ].find((_) => _.id === id) ??
      genUser({
        id
      })) as UserRefined
  }),
  useLazyFindPrescriptionsQuery: [[], {}],
  useLazyFindSamplesQuery: [[], {}],
  useLazyGetAnalysisReportDocumentIdsQuery: [[], {}],
  useLazyGetDocumentDownloadSignedUrlQuery: [
    'https://maestro.beta.gouv.fr',
    {}
  ],
  useLazyGetPrescriptionSubstancesQuery: [[], {}],
  useLazyGetSampleAnalysisQuery: [genPartialAnalysis(), {}],
  useLazyGetSampleQuery: [genCreatedPartialSample(), {}],
  useLazyGetUserQuery: [genUser({}), {}],
  useLazySearchAddressesQuery: [[], {}],
  useLazySearchCompaniesQuery: [[], {}],
  useLogoutMutation: [fn(), {}],
  useUpdateAnalysisMutation: [fn(), {}],
  useUpdateDocumentMutation: [fn(), {}],
  useUpdateNotificationMutation: [fn(), {}],
  useUpdateNotificationsMutation: [fn(), {}],
  useUpdatePrescriptionMutation: [fn(), {}],
  useUpdateProgrammingPlanLocalStatusMutation: [fn(), {}],
  useUpdateProgrammingPlanStatusMutation: [fn(), {}],
  useUpdateLaboratoryAnalyticalCompetenceMutation: [fn(), {}],
  useUpdateLocalPrescriptionMutation: [fn(), {}],
  useUpdateSampleMutation: [fn(), {}],
  useGetRootNoticeQuery: {
    data: { type: 'root', title: 'titre', description: 'description' }
  },
  useUpdateRootNoticeMutation: [fn(), {}],
  useGetDashboardNoticeQuery: {
    data: { type: 'dashboard', title: 'titre', description: 'description' }
  },
  useUpdateDashboardNoticeMutation: [fn(), {}],
  useMascaradeStartMutation: [fn(), {}],
  useMascaradeStopMutation: [fn(), {}],
  useCreateUserMutation: [fn(), {}],
  useUpdateUserMutation: [fn(), {}],
  useChangeRoleMutation: [fn(), {}],
  useLazyFindCompaniesQuery: [[], {}],
  useGetSampleSpecificDataQuery: {
    data: {
      DAOA_BREEDING: {
        inDai: false,
        attribute: '',
        sachaCommemoratifSigle: '' as CommemoratifSigle,
        values: {}
      },
      DAOA_SLAUGHTER: {
        inDai: false,
        attribute: '',
        sachaCommemoratifSigle: '' as CommemoratifSigle,
        values: {}
      }
    }
  },
  useUpdateSampleSpecificDataAttributeMutation: [fn(), {}],
  useUpdateSampleSpecificDataAttributeValueMutation: [fn(), {}],
  useGetSachaCommemoratifsQuery: {
    data: {}
  },
  useUpdateSachaCommemoratifsMutation: [fn(), {}]
};

export const mockApiClient = getMockApi({});
