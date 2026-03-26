import { buildTypedMutation } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const mascaradeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    mascaradeStart: buildTypedMutation(builder, '/mascarade/:userId', 'post'),
    mascaradeStop: buildTypedMutation(builder, '/mascarade', 'post')
  })
});

export const { useMascaradeStartMutation, useMascaradeStopMutation } =
  mascaradeApi;
