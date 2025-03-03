import { TypedUseLazyQuery, TypedUseQuery } from '@reduxjs/toolkit/dist/query/react';
import { Props } from '../views/SampleView/components/AnalysisDocumentPreview';
import { ApiClient } from './apiClient';

type MockApi<T extends Partial<ApiClient>> = {
  [Key in keyof T]: T[Key] extends TypedUseQuery<infer D, any, any>
    ? {data: D}
    : T[Key] extends TypedUseLazyQuery<infer E, any, any>
      ? E
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
    }
    return acc;
  }, {} as T);
};

export const mockApiClient =  getMockApi<Props['apiClient']>({
  useGetDocumentQuery: { data:{
    createdAt: new Date(12345),
  createdBy: 'Storybook',
  id: '',
  kind: 'AnalysisRequestDocument',
  filename: 'analyses.pdf'
} },
  useLazyGetDocumentDownloadSignedUrlQuery: 'https://maestro.beta.gouv.fr'
})
