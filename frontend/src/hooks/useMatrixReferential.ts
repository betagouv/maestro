import type { MatrixReferential } from 'maestro-shared/schema/Matrix/MatrixReferential';
import { useContext } from 'react';
import { ApiClientContext } from '../services/apiClient';

const emptyMatrixReferential: MatrixReferential = {
  matrixKinds: [],
  matrices: []
};

export const useMatrixReferential = (): MatrixReferential => {
  const apiClient = useContext(ApiClientContext);
  const { data = emptyMatrixReferential } =
    apiClient.useFindMatrixReferentialQuery();
  return data;
};
