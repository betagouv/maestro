import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import config from '../utils/config';
import { withAuthHeader } from 'src/services/auth-headers';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiEndpoint}/api`,
    prepareHeaders: withAuthHeader,
  }),
  tagTypes: [],
  endpoints: () => ({}),
});
