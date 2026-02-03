import { isNil, omitBy } from 'lodash-es';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import {
  LocalPrescription,
  LocalPrescriptionUpdate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  LocalPrescriptionComment,
  LocalPrescriptionCommentToCreate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { api } from 'src/services/api.service';

const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLocalPrescription: builder.query<
      LocalPrescription,
      LocalPrescriptionKey & Pick<FindLocalPrescriptionOptions, 'includes'>
    >({
      query: ({
        prescriptionId,
        region,
        department,
        companySiret,
        includes
      }) => ({
        url: `prescriptions/${prescriptionId}/regions/${region}${
          department ? `/departments/${department}` : ''
        }${companySiret ? `/companies/${companySiret}` : ''}`,
        params: { includes }
      }),
      transformResponse: (response) => LocalPrescription.parse(response),
      providesTags: (_result, _error, { prescriptionId }) => [
        { type: 'LocalPrescription', id: prescriptionId }
      ]
    }),
    findLocalPrescriptions: builder.query<
      LocalPrescription[],
      FindLocalPrescriptionOptions
    >({
      query: (findOptions) => ({
        url: 'prescriptions/regions',
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => LocalPrescription.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'LocalPrescription', id: 'LIST' },
        ...(result ?? []).map(({ prescriptionId }) => ({
          type: 'LocalPrescription' as const,
          id: prescriptionId
        }))
      ]
    }),
    updateLocalPrescription: builder.mutation<
      LocalPrescription,
      LocalPrescriptionKey & {
        prescriptionUpdate: LocalPrescriptionUpdate;
      }
    >({
      query: ({ prescriptionId, region, department, prescriptionUpdate }) => ({
        url: `prescriptions/${prescriptionId}/regions/${region}${
          department ? `/departments/${department}` : ''
        }`,
        method: 'PUT',
        body: prescriptionUpdate
      }),
      invalidatesTags: (_result, _error, { prescriptionId }) => [
        { type: 'LocalPrescription', id: 'LIST' },
        { type: 'LocalPrescription', id: prescriptionId }
      ],
      transformResponse: (response) => LocalPrescription.parse(response)
    }),
    commentLocalPrescription: builder.mutation<
      LocalPrescriptionComment,
      LocalPrescriptionKey & {
        commentToCreate: LocalPrescriptionCommentToCreate;
      }
    >({
      query: ({ prescriptionId, region, department, commentToCreate }) => ({
        url: `prescriptions/${prescriptionId}/regions/${region}${
          department ? `/departments/${department}` : ''
        }/comments`,
        method: 'POST',
        body: commentToCreate
      }),
      transformResponse: (response) => LocalPrescriptionComment.parse(response),
      invalidatesTags: (_result, _error, { prescriptionId }) => [
        { type: 'LocalPrescription', id: prescriptionId }
      ]
    })
  })
});

export const {
  useGetLocalPrescriptionQuery,
  useFindLocalPrescriptionsQuery,
  useCommentLocalPrescriptionMutation,
  useUpdateLocalPrescriptionMutation
} = {
  ...prescriptionApi
};
