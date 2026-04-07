import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findNotifications: buildTypedQuery(builder, '/notifications', {
      providesTags: (result) => [
        { type: 'Notification', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Notification' as const,
          id
        }))
      ]
    }),
    updateNotification: buildTypedMutation(
      builder,
      '/notifications/:notificationId',
      'put',
      {
        invalidatesTags: [{ type: 'Notification', id: 'LIST' }]
      }
    ),
    updateNotifications: buildTypedMutation(builder, '/notifications', 'put', {
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }]
    })
  })
});

export const {
  useFindNotificationsQuery,
  useUpdateNotificationMutation,
  useUpdateNotificationsMutation
} = notificationApi;
