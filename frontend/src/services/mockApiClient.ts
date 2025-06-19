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
      ? E
      : T[Key] extends TypedUseMutation<any, any, any>
        ? [() => Promise<unknown>, { isSuccess?: boolean }]
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
    } else if (key.startsWith('useLazyGet') || key.startsWith('useLazyFind')) {
      // @ts-expect-error TS7053
      acc[key] = () => [
        (arg?: any) => ({
          unwrap: async () => {
            // @ts-expect-error TS7053
            const value = mockApi[key];
            return typeof value === 'function' ? value(arg) : value;
          }
        })
      ];
    } else if (
      key.startsWith('useCreate') ||
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
  useGetDocumentQuery: {
    data: genDocument({
      createdAt: new Date(12345),
      createdBy: 'Storybook',
      kind: 'AnalysisRequestDocument',
      filename: 'analyses.pdf'
    })
  },
  useLazyGetDocumentDownloadSignedUrlQuery: 'https://maestro.beta.gouv.fr',
  useGetLaboratoryQuery: {
    data: LaboratoryFixture
  },
  useUpdateSampleMutation: [async () => fn(), { isSuccess: true }],
  useUpdateAnalysisMutation: [async () => fn(), { isSuccess: true }],
  useUpdateProgrammingPlanStatusMutation: [
    async () => fn(),
    { isSuccess: true }
  ],
  useUpdateProgrammingPlanRegionalStatusMutation: [
    async () => fn(),
    { isSuccess: true }
  ],
  useCreateOrUpdateSampleMutation: [async () => fn(), { isSuccess: true }],
  useCreateDocumentMutation: [async () => fn(), {}],
  useCreateProgrammingPlanMutation: [async () => fn(), { isSuccess: true }],
  useDeleteDocumentMutation: [async () => fn(), { isSuccess: true }],
  useGetSampleAnalysisQuery: {
    data: genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sampler1Fixture.id,
      status: 'Residues'
    })
  },
  useFindLaboratoriesQuery: { data: [] },
  useFindNotificationsQuery: { data: [] },
  useFindPrescriptionsQuery: { data: [] },
  useFindProgrammingPlansQuery: { data: [] },
  useFindRegionalPrescriptionsQuery: { data: [] },
  useFindSamplesQuery: { data: [] },
  useFindUsersQuery: { data: [] },
  useFindResourcesQuery: { data: [] },
  useGetProgrammingPlanQuery: { data: genProgrammingPlan() },
  useGetProgrammingPlanByYearQuery: (year: number) => ({
    data: genProgrammingPlan({
      year
    })
  }),
  useGetPrescriptionSubstancesQuery: { data: [] },
  useGetRegionsGeoJsonQuery: {
    data: JSON.parse(JSON.stringify(regionsJson))
  },
  useLazyGetPrescriptionSubstancesQuery: [],
  useLazyFindPrescriptionsQuery: [],
  useLazyFindSamplesQuery: [],
  useLazyGetSampleQuery: genCreatedPartialSample(),
  useLazyGetSampleAnalysisQuery: genPartialAnalysis(),
  useCountSamplesQuery: {
    data: 0
  },
  useGetSampleQuery: {
    data: genCreatedPartialSample()
  },
  useDeleteSampleMutation: [async () => fn(), { isSuccess: true }],
  useUpdatePrescriptionMutation: [async () => fn(), { isSuccess: true }],
  useAddPrescriptionMutation: [async () => fn(), { isSuccess: true }],
  useDeletePrescriptionMutation: [async () => fn(), { isSuccess: true }]
};

export const mockApiClient = getMockApi<ApiClient>(defaultMockApiClientConf);
