import { isNil, omitBy } from 'lodash-es';
import { FindNotificationOptions } from 'maestro-shared/schema/Notification/FindNotificationOptions';
import {
  Notification,
  NotificationUpdate
} from 'maestro-shared/schema/Notification/Notification';
import { api } from 'src/services/api.service';

const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findNotifications: builder.query<Notification[], FindNotificationOptions>({
      query: (findOptions) => ({
        url: '/notifications',
        method: 'GET',
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Notification.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'Notification', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Notification' as const,
          id
        }))
      ]
    }),
    updateNotification: builder.mutation<
      Notification,
      { notificationId: string; notificationUpdate: NotificationUpdate }
    >({
      query: ({ notificationId, notificationUpdate }) => ({
        url: `/notifications/${notificationId}`,
        method: 'PUT',
        body: notificationUpdate
      }),
      transformResponse: (response: any) => Notification.parse(response),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }]
    }),
    updateNotifications: builder.mutation<
      Notification[],
      FindNotificationOptions & {
        notificationUpdate: NotificationUpdate;
      }
    >({
      query: ({ notificationUpdate, ...findNotificationOptions }) => ({
        url: `/notifications`,
        params: findNotificationOptions,
        method: 'PUT',
        body: notificationUpdate
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Notification.parse(omitBy(_, isNil))),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }]
    })
  })
});

export const {
  useFindNotificationsQuery,
  useUpdateNotificationMutation,
  useUpdateNotificationsMutation
} = notificationApi;
