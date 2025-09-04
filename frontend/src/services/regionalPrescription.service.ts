import { isNil, omitBy } from 'lodash-es';
import { FindRegionalPrescriptionOptions } from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  RegionalPrescription,
  RegionalPrescriptionUpdate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import {
  RegionalPrescriptionComment,
  RegionalPrescriptionCommentToCreate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { api } from 'src/services/api.service';

const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findRegionalPrescriptions: builder.query<
      RegionalPrescription[],
      FindRegionalPrescriptionOptions
    >({
      query: (findOptions) => ({
        url: 'prescriptions/regional',
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => RegionalPrescription.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'RegionalPrescription', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'RegionalPrescription' as const,
          id
        }))
      ]
    }),
    updateRegionalPrescription: builder.mutation<
      RegionalPrescription,
      {
        regionalPrescriptionId: string;
        prescriptionUpdate: RegionalPrescriptionUpdate;
      }
    >({
      query: ({ regionalPrescriptionId, prescriptionUpdate }) => ({
        url: `prescriptions/regional/${regionalPrescriptionId}`,
        method: 'PUT',
        body: prescriptionUpdate
      }),
      invalidatesTags: (_result, _error, { regionalPrescriptionId }) => [
        { type: 'RegionalPrescription', id: 'LIST' },
        { type: 'RegionalPrescription', id: regionalPrescriptionId }
      ],
      transformResponse: (response) => RegionalPrescription.parse(response)
    }),
    commentRegionalPrescription: builder.mutation<
      RegionalPrescriptionComment,
      {
        regionalPrescriptionId: string;
        commentToCreate: RegionalPrescriptionCommentToCreate;
      }
    >({
      query: ({ regionalPrescriptionId, commentToCreate }) => ({
        url: `prescriptions/regional/${regionalPrescriptionId}/comments`,
        method: 'POST',
        body: commentToCreate
      }),
      transformResponse: (response) =>
        RegionalPrescriptionComment.parse(response),
      invalidatesTags: (_result, _error, { regionalPrescriptionId }) => [
        { type: 'RegionalPrescription', id: regionalPrescriptionId }
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
