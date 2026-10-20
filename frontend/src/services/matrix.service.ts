import { buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const matrixApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findMatrixReferential: buildTypedQuery(builder, '/matrices')
  })
});

export const { useFindMatrixReferentialQuery } = matrixApi;
