import {
  BaseQueryFn,
  EndpointBuilder,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query';
import { isNil, omitBy } from 'lodash-es';
import {
  MaestroRoutes,
  RouteMethod,
  routes,
  RouteValidator,
  ToRoute
} from 'maestro-shared/routes';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { api } from 'src/services/api.service';

export const analysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSampleAnalysis: builder.query<PartialAnalysis, string>({
      query: (sampleId) => ({
        url: 'analysis',
        params: { sampleId }
      }),
      transformResponse: (response: any) =>
        PartialAnalysis.parse(omitBy(response, isNil)),
      providesTags: (_result, _error, sampleId) => [
        { type: 'SampleAnalysis', id: sampleId }
      ]
    }),
    createAnalysis: toto(builder, '/analysis', 'post', (draft) => [
      { type: 'SampleAnalysis', id: draft.sampleId },
      { type: 'Sample' as const, id: draft.sampleId },
      { type: 'Sample', id: 'LIST' }
    ]),
    updateAnalysis: builder.mutation<PartialAnalysis, PartialAnalysis>({
      query: (partialAnalysis) => ({
        url: `analysis/${partialAnalysis.id}`,
        method: 'PUT',
        body: partialAnalysis
      }),
      transformResponse: (response: any) =>
        PartialAnalysis.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error, draft) => [
        { type: 'SampleAnalysis', id: draft.sampleId },
        { type: 'Sample' as const, id: draft.sampleId },
        { type: 'Sample', id: 'LIST' }
      ]
    })
  })
});

export const { useCreateAnalysisMutation, useUpdateAnalysisMutation } = {
  ...analysisApi
};

type TUTU<T extends MaestroRoutes> =
  keyof (typeof routes)[T] extends RouteMethod
    ? keyof (typeof routes)[T]
    : never;

type RORO<
  T extends MaestroRoutes,
  M extends TUTU<T>,
  A = (typeof routes)[T][M]
> = A extends ToRoute ? A : never;

const toto = <
  T extends MaestroRoutes,
  M extends TUTU<T>,
  R extends RORO<T, M>,
  B extends EndpointBuilder<
    BaseQueryFn<
      string | FetchArgs,
      unknown,
      FetchBaseQueryError,
      object,
      FetchBaseQueryMeta
    >,
    string,
    'api'
  >
>(
  builder: B,
  route: T,
  method: M,
  invalidatesTags: (
    draft: RouteValidator<T, M, 'body'>
  ) => { type: string; id: string }[]
) => {
  // @ts-expect-error TS2322
  const auie: R = routes[route][method];

  return builder.mutation<
    RouteValidator<T, M, 'response'>,
    RouteValidator<T, M, 'body'>
  >({
    query: (draft) => ({
      url: route,
      method: method.toUpperCase(),
      body: draft
    }),
    // FIXME
    // @ts-expect-error TS2322
    transformResponse: (response: any) =>
      auie.response.parse(omitBy(response, isNil)),
    invalidatesTags: (_result, _error, draft) => draft ?? invalidatesTags(draft)
  });
};
