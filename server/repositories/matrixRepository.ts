import { groupBy } from 'lodash-es';
import type { MatrixReferential } from 'maestro-shared/schema/Matrix/MatrixReferential';
import { kysely } from './kysely';

const findReferential = async (trx = kysely): Promise<MatrixReferential> => {
  const [matrixKinds, matrices, links] = await Promise.all([
    trx.selectFrom('matrixKinds').selectAll().orderBy('code').execute(),
    trx.selectFrom('matrices').selectAll().orderBy('code').execute(),
    trx
      .selectFrom('matrixKindMatrices')
      .selectAll()
      .orderBy('matrixCode')
      .execute()
  ]);

  const linksByKind = groupBy(links, (link) => link.matrixKindCode);

  return {
    matrixKinds: matrixKinds.map((matrixKind) => ({
      ...matrixKind,
      matrices: (linksByKind[matrixKind.code] ?? []).map(
        (link) => link.matrixCode
      )
    })),
    matrices
  };
};

export const matrixRepository = {
  findReferential
};
