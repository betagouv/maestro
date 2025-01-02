import fp from 'lodash';
import { Region } from 'shared/referential/Region';
import { FindRegionalPrescriptionOptions } from 'shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  RegionalPrescription,
  RegionalPrescriptionUpdate
} from 'shared/schema/RegionalPrescription/RegionalPrescription';
import {
  RegionalPrescriptionComment,
  RegionalPrescriptionCommentToCreate
} from 'shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { api } from 'src/services/api.service';

export const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findRegionalPrescriptions: builder.query<
      RegionalPrescription[],
      FindRegionalPrescriptionOptions
    >({
      query: (findOptions) => ({
        url: 'prescriptions/regions',
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => RegionalPrescription.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'RegionalPrescription', id: 'LIST' },
        ...(result ?? []).map(({ prescriptionId }) => ({
          type: 'RegionalPrescription' as const,
          id: prescriptionId
        }))
      ]
    }),
    updateRegionalPrescription: builder.mutation<
      RegionalPrescription,
      {
        prescriptionId: string;
        region: Region;
        prescriptionUpdate: RegionalPrescriptionUpdate;
      }
    >({
      query: ({ prescriptionId, region, prescriptionUpdate }) => ({
        url: `prescriptions/${prescriptionId}/regions/${region}`,
        method: 'PUT',
        body: prescriptionUpdate
      }),
      invalidatesTags: (_result, _error, { prescriptionId }) => [
        { type: 'RegionalPrescription', id: 'LIST' },
        { type: 'RegionalPrescription', id: prescriptionId }
      ],
      transformResponse: (response) => RegionalPrescription.parse(response)
    }),
    commentRegionalPrescription: builder.mutation<
      RegionalPrescriptionComment,
      {
        prescriptionId: string;
        region: Region;
        commentToCreate: RegionalPrescriptionCommentToCreate;
      }
    >({
      query: ({ prescriptionId, region, commentToCreate }) => ({
        url: `prescriptions/${prescriptionId}/regions/${region}/comments`,
        method: 'POST',
        body: commentToCreate
      }),
      transformResponse: (response) =>
        RegionalPrescriptionComment.parse(response),
      invalidatesTags: (_result, _error, { prescriptionId }) => [
        { type: 'RegionalPrescription', id: prescriptionId }
      ]
    })
  })
});

export const {
  useFindRegionalPrescriptionsQuery,
  useCommentRegionalPrescriptionMutation,
  useUpdateRegionalPrescriptionMutation
} = {
  ...prescriptionApi
};
