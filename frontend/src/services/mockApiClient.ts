import {
  TypedUseLazyQuery,
  TypedUseMutation,
  TypedUseQuery
} from '@reduxjs/toolkit/dist/query/react';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  Sample11Fixture
} from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { fn } from 'storybook/test';
import regionsJson from '../../../server/data/regions.json';
import { ApiClient } from './apiClient';

type MockApi<T extends Partial<ApiClient>> = {
  [Key in keyof T]: T[Key] extends TypedUseQuery<infer D, any, any>
    ? { data: D } | ((arg: any) => { data: D })
    : T[Key] extends TypedUseLazyQuery<infer E, any, any>
      ? [E, { isSuccess?: boolean; isLoading?: boolean }]
      : T[Key] extends TypedUseMutation<any, any, any>
        ? [() => Promise<unknown>, { isSuccess?: boolean; isLoading?: boolean }]
        : null;
};

export const getMockApi = <T extends Partial<ApiClient>>(
  mockApi: Partial<MockApi<T>>
): T => {
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
      key.startsWith('useDelete')
    ) {
      // @ts-expect-error TS7053
      acc[key] = () => mockApi[key];
    }
    return acc;
  }, {} as T);
};
export const defaultMockApiClientConf: Partial<MockApi<ApiClient>> = {
  useAddPrescriptionMutation: [async () => fn(), { isSuccess: true }],
  useCommentRegionalPrescriptionMutation: [
    async () => fn(),
    { isSuccess: true }
  ],
  useCountSamplesQuery: {
    data: 0
  },
  useCreateDocumentMutation: [async () => fn(), {}],
  useCreateOrUpdateSampleMutation: [
    async () => fn(),
    { isSuccess: true, isLoading: false }
  ],
  useCreateProgrammingPlanMutation: [async () => fn(), { isSuccess: true }],
  useDeleteDocumentMutation: [async () => fn(), { isSuccess: true }],
  useDeletePrescriptionMutation: [async () => fn(), { isSuccess: true }],
  useDeleteSampleMutation: [async () => fn(), { isSuccess: true }],
  useFindLaboratoriesQuery: { data: [] },
  useFindNotificationsQuery: { data: [] },
  useFindPrescriptionsQuery: { data: [] },
  useFindProgrammingPlansQuery: { data: [] },
  useFindRegionalPrescriptionsQuery: { data: [] },
  useFindResourcesQuery: { data: [] },
  useFindSamplesQuery: { data: [] },
  useFindUsersQuery: { data: [] },
  useGetAuthRedirectUrlQuery: {
    data: {
      url: ''
    }
  },
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
  useGetPrescriptionSubstancesQuery: { data: [] },
  useGetProgrammingPlanByYearQuery: (year: number) => ({
    data: genProgrammingPlan({
      year
    })
  }),
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
  useLazyFindPrescriptionsQuery: [[], { isSuccess: true }],
  useLazyFindSamplesQuery: [[], { isSuccess: true }],
  useLazyGetDocumentDownloadSignedUrlQuery: [
    'https://maestro.beta.gouv.fr',
    { isSuccess: true }
  ],
  useLazyGetPrescriptionSubstancesQuery: [[], { isSuccess: true }],
  useLazyGetSampleAnalysisQuery: [genPartialAnalysis(), { isSuccess: true }],
  useLazyGetSampleQuery: [genCreatedPartialSample(), { isSuccess: true }],
  useLazySearchAddressesQuery: [[], { isSuccess: true }],
  useLazySearchCompaniesQuery: [[], { isSuccess: true }],
  useUpdateAnalysisMutation: [async () => fn(), { isSuccess: true }],
  useUpdatePrescriptionMutation: [async () => fn(), { isSuccess: true }],
  useUpdateProgrammingPlanRegionalStatusMutation: [
    async () => fn(),
    { isSuccess: true }
  ],
  useUpdateProgrammingPlanStatusMutation: [
    async () => fn(),
    { isSuccess: true }
  ],
  useUpdateRegionalPrescriptionMutation: [
    async () => fn(),
    { isSuccess: true }
  ],
  useUpdateSampleMutation: [async () => fn(), { isSuccess: true }],
  useGetAnalysisReportDocumentIdsQuery: { data: ['fakeDocumentId'] },
  useDeleteAnalysisReportDocumentMutation: [
    async () => fn(),
    { isSuccess: true }
  ]
};

export const mockApiClient = getMockApi<ApiClient>(defaultMockApiClientConf);
