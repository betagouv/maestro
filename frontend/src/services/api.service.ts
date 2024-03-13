import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { withAuthHeader } from 'src/services/auth-headers';
import config from '../utils/config';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiEndpoint}/api`,
    prepareHeaders: withAuthHeader,
  }),
  tagTypes: ['Sample', 'User'],
  endpoints: () => ({}),
});
