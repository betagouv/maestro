import { Matrix, MatrixDeprecated } from './Matrix';
import { MatrixKind } from './MatrixKind';

const MatrixListByKindDeprecated: Record<MatrixDeprecated, Matrix[]> =
  Object.fromEntries(
    MatrixDeprecated.options
      .map((key) => [key, [key]])
      .filter(([_, value]) => value !== undefined)
  );

export const MatrixListByKind: Record<MatrixKind, Matrix[]> = {
  ...MatrixListByKindDeprecated,
  A00KR: Matrix.extract([
    'A00KT',
    'A0DLB',
    'A00KX',
    'A00LD',
    'A00LE',
    'A00MA',
    'A00NE',
    'A00FV',
    'A00FX',
    'A00FY',
    'A00GL'
  ]).options,
  A012R: Matrix.extract(['A013Q']).options,
  A00GY: Matrix.extract(['A00GZ', 'A00HF']).options,
  A00RT: Matrix.extract(['A00RT']).options,
  A00JD: Matrix.extract(['A00JD']).options,
  A04JS: Matrix.extract(['A01LC']).options,
  A001M: Matrix.extract(['A001P', 'A001R', 'A00DL', 'A001N', 'A001M']).options,
  A00FN: Matrix.extract(['A00FN']).options,
  A010V: Matrix.extract(['A010V']).options,
  A03NJ: Matrix.extract(['A03NJ']).options,
  A00TQ: Matrix.extract(['A00TQ']).options,
  A00FX: Matrix.extract(['A00FV', 'A00FY', 'A00FX']).options,
  A015M: Matrix.extract(['A015M']).options,
  A00JN: Matrix.extract(['A00JM', 'A00JP', 'A00JR', 'A00JZ', 'A00JN']).options,
  A00LD: Matrix.extract(['A00LD']).options,
  A04MA: Matrix.extract([
    'A00XB',
    'A00XD',
    'A00XA',
    'A00YE',
    'A017L',
    'A00YF',
    'A00YQ',
    'A00VV',
    'A00VX',
    'A00YP',
    'A00VT',
    'A00XZ',
    'A00XV',
    'A04MA'
  ]).options,
  A01EA: Matrix.extract(['A01EA']).options,
  A012B: Matrix.extract(['A00PG', 'A012A', 'A012G', 'A0BAV', 'A012J', 'A012B'])
    .options,
  A00PX: Matrix.extract(['A00PX', 'A00PH', 'A00PY', 'A00PZ']).options,
  A01JT: Matrix.extract(['A01JT']).options,
  A042C: Matrix.extract(['A00KX', 'A00LE']).options,
  A00KE: Matrix.extract(['A00KE']).options,
  A01BQ: Matrix.extract(['A01BQ', 'A01BR']).options,
  A01DT: ['A01EE', 'A01EP', 'A01EY', 'A01FH', 'A01FM', 'A01DT', 'A01FN'],
  A0DQS: Matrix.extract(['A0DQS']).options,
  A00HZ: Matrix.extract(['A00JA', 'A00JB', 'A0DMM']).options,
  A01DV: Matrix.extract(['A01DX', 'A01DY']).options,
  A001D: Matrix.extract(['A001D']).options,
  A000L: Matrix.extract(['A000N', 'A000R', 'A000L']).options,
  A00HQ: Matrix.extract(['A00HQ', 'A00HY']).options,
  A01QX: Matrix.extract(['A01QV#F28.A0C0S']).options,
  A01RJ: Matrix.extract(['A01RJ#F28.A0C0S']).options,
  A01RL: Matrix.extract(['A01RL#F28.A0C0S']).options,
  A01RG: Matrix.extract(['A01RG#F28.A0C0S']).options,
  A01SN: Matrix.extract([
    'A01SP#F28.A0C0S',
    'A01SP#F31.A0CSD',
    'A01SQ#F28.A0C0S',
    'A01SN#F26.A07XE'
  ]).options,
  A031E: Matrix.extract(['A031G', 'A031K']).options,
  TODO1: Matrix.extract(['TODO1']).options,
  TODO2: Matrix.extract(['TODO2']).options
};
