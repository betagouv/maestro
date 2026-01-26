import { isNil, omitBy } from 'lodash-es';
import { FindLaboratoryOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryOptions';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  LaboratoryAnalyticalCompetence,
  LaboratoryAnalyticalCompetenceToSave
} from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalCompetence';
import { api } from 'src/services/api.service';

const laboratoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLaboratory: builder.query<Laboratory, string>({
      query: (laboratoryId) => `laboratories/${laboratoryId}`,
      transformResponse: (response: any) =>
        Laboratory.parse(omitBy(response, isNil)),
      providesTags: (_result, _error, laboratoryId) => [
        { type: 'Laboratory', id: laboratoryId }
      ]
    }),
    findLaboratories: builder.query<Laboratory[], FindLaboratoryOptions>({
      query: (findOptions) => ({
        url: 'laboratories',
        params: omitBy(findOptions, isNil)
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Laboratory.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'Laboratory', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Laboratory' as const,
          id
        }))
      ]
    }),
    getLaboratoryAnalyticalCompetences: builder.query<
      LaboratoryAnalyticalCompetence[],
      string
    >({
      query: (laboratoryId) =>
        `laboratories/${laboratoryId}/analytical-competences`,
      transformResponse: (response: any[]) =>
        response.map((_) =>
          LaboratoryAnalyticalCompetence.parse(omitBy(_, isNil))
        ),
      providesTags: (_result, _error, laboratoryId) => [
        {
          type: 'LaboratoryAnalyticalCompetence',
          id: laboratoryId
        }
      ]
    }),
    createLaboratoryAnalyticalCompetence: builder.mutation<
      LaboratoryAnalyticalCompetence,
      {
        laboratoryId: string;
        laboratoryAnalyticalCompetence: LaboratoryAnalyticalCompetenceToSave;
      }
    >({
      query: ({ laboratoryId, laboratoryAnalyticalCompetence }) => ({
        url: `laboratories/${laboratoryId}/analytical-competences`,
        method: 'POST',
        body: laboratoryAnalyticalCompetence
      }),
      transformResponse: (response: any) =>
        LaboratoryAnalyticalCompetence.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error, { laboratoryId }) => [
        {
          type: 'LaboratoryAnalyticalCompetence',
          id: laboratoryId
        }
      ]
    }),
    updateLaboratoryAnalyticalCompetence: builder.mutation<
      LaboratoryAnalyticalCompetence,
      {
        laboratoryId: string;
        analyticalCompetenceId: string;
        laboratoryAnalyticalCompetence: LaboratoryAnalyticalCompetenceToSave;
      }
    >({
      query: ({
        laboratoryId,
        analyticalCompetenceId,
        laboratoryAnalyticalCompetence
      }) => ({
        url: `laboratories/${laboratoryId}/analytical-competences/${analyticalCompetenceId}`,
        method: 'PUT',
        body: laboratoryAnalyticalCompetence
      }),
      transformResponse: (response: any) =>
        LaboratoryAnalyticalCompetence.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error, { laboratoryId }) => [
        {
          type: 'LaboratoryAnalyticalCompetence',
          id: laboratoryId
        }
      ]
    })
  })
});

export const {
  useGetLaboratoryQuery,
  useFindLaboratoriesQuery,
  useGetLaboratoryAnalyticalCompetencesQuery,
  useCreateLaboratoryAnalyticalCompetenceMutation,
  useUpdateLaboratoryAnalyticalCompetenceMutation
} = laboratoryApi;
