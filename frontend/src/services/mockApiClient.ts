import {
  TypedUseLazyQuery,
  TypedUseMutation,
  TypedUseQuery
} from '@reduxjs/toolkit/dist/query/react';
import { fn } from '@storybook/test';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { ApiClient } from './apiClient';

type MockApi<T extends Partial<ApiClient>> = {
  [Key in keyof T]: T[Key] extends TypedUseQuery<infer D, any, any>
    ? { data: D }
    : T[Key] extends TypedUseLazyQuery<infer E, any, any>
      ? E
      : T[Key] extends TypedUseMutation<any, any, any>
        ? [() => Promise<unknown>, { isSuccess: boolean }]
        : null;
};

export const getMockApi = <T extends Partial<ApiClient>>(
  mockApi: MockApi<T>
): T => {
  return Object.keys(mockApi).reduce((acc, key) => {
    if (key.startsWith('useGet') || key.startsWith('useFind')) {
      // @ts-expect-error TS7053
      acc[key] = () => mockApi[key];
    } else if (key.startsWith('useLazyGet')) {
      // @ts-expect-error TS7053
      acc[key] = () => [
        () => ({
          // @ts-expect-error TS7053
          unwrap: async () => mockApi[key]
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

export const defaultMockApiClientConf: MockApi<ApiClient> = {
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
    data: {
      id: 'fakeLaboratoryId',
      name: 'SCL 34',
      emails: ['fakeEmail@gouv.fr']
    }
  },
  useUpdateSampleMutation: [async () => fn(), { isSuccess: true }],
  useUpdateAnalysisMutation: [async () => fn(), { isSuccess: true }],
  useCreateOrUpdateSampleMutation: [async () => fn(), { isSuccess: true }],
  useCreateDocumentMutation: [async () => fn(), { isSuccess: true }],
  useDeleteDocumentMutation: [async () => fn(), { isSuccess: true }],
  useGetSampleAnalysisQuery: {
    data: genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sampler1Fixture.id,
      status: 'Residues'
    })
  },
  useFindPrescriptionsQuery: { data: [] },
  useFindRegionalPrescriptionsQuery: { data: [] },
  useGetProgrammingPlanQuery: { data: genProgrammingPlan() },
  useGetPrescriptionSubstancesQuery: { data: [] }
  useLazyGetPrescriptionSubstancesQuery: []
};

export const mockApiClient = getMockApi<ApiClient>(defaultMockApiClientConf);
