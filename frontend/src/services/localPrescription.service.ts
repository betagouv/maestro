import { isNil, omitBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Region } from 'maestro-shared/referential/Region';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import {
  LocalPrescription,
  LocalPrescriptionUpdate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  LocalPrescriptionComment,
  LocalPrescriptionCommentToCreate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { api } from 'src/services/api.service';

const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
      {
        prescriptionId: string;
        region: Region;
        department?: Department;
        prescriptionUpdate: LocalPrescriptionUpdate;
      }
    >({
      query: ({ prescriptionId, region, department, prescriptionUpdate }) => ({
        url: `prescriptions/${prescriptionId}/regions/${region}${
          department
            ? `/departments/${department}${prescriptionUpdate.key === 'slaughterhouseSampleCounts' ? '/slaughterhouses' : ''}`
            : ''
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
      {
        prescriptionId: string;
        region: Region;
        commentToCreate: LocalPrescriptionCommentToCreate;
      }
    >({
      query: ({ prescriptionId, region, commentToCreate }) => ({
        url: `prescriptions/${prescriptionId}/regions/${region}/comments`,
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
  useFindLocalPrescriptionsQuery,
  useCommentLocalPrescriptionMutation,
  useUpdateLocalPrescriptionMutation
} = {
  ...prescriptionApi
};
