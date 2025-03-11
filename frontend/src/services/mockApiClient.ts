import {
  TypedUseLazyQuery,
  TypedUseMutation,
  TypedUseQuery
} from '@reduxjs/toolkit/dist/query/react';
import { ApiClient } from './apiClient';
import { fn } from '@storybook/test';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';

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
    if (key.startsWith('useGet')) {
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
    } else if (key.startsWith('useUpdate')){
      // @ts-expect-error TS7053
      acc[key] = () => mockApi[key]
    }
    return acc;
  }, {} as T);
};

export const defaultMockApiClientConf : MockApi<ApiClient> = {
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
      email: 'fakeEmail@gouv.fr'
    }
  },
  useUpdateSampleMutation: [async () => fn(), { isSuccess: true }],
  useUpdateAnalysisMutation: [async () => fn(), { isSuccess: true }],
  useGetSampleAnalysisQuery: {
    data: genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sampler1Fixture.id,
      status: 'InReview'
    })
  }
}

export const mockApiClient = getMockApi<ApiClient>(defaultMockApiClientConf);
