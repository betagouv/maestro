import { z } from 'zod';
import { MatrixLabels } from './MatrixLabels';

export const MatrixDeprecated = z.enum([
  'A00YZ',
  'A014C',
  'A00KR',
  'A01LB',
  'A00FR',
  'A0DEH',
  'A00GL',
  'A00NE',
  'A0DBP',
  'A0DVX',
  'A01GL',
  'A01JV',
  'A0DLB',
  'A0DFR',
  'A01GG',
  'A00HC',
  'A00QH',
  'A001C',
  'A00RE',
  'A012R',
  'A00SA',
  'A01DP',
  'A0D9Y',
  'A01HG',
  'A013Q',
  'A00RY',
  'A010C',
  'A00MA',
  'A00KT',
  'A000F',
  'A01LF',
  'A00PH',
  'A015L'
]);

export type MatrixDeprecated = z.infer<typeof MatrixDeprecated>;

export const MatrixEffective = z.enum([
  'A00GZ',
  'A00HF',
  'A00RT',
  'A00JD',
  'A01LC',
  'A001P',
  'A001R',
  'A00DL',
  'A001N',
  'A001M',
  'A00FN',
  'A010V',
  'A03NJ',
  'A00TQ',
  'A00FV',
  'A00FY',
  'A00FX',
  'A015M',
  'A00JM',
  'A00JP',
  'A00JR',
  'A00JZ',
  'A00JN',
  'A00LD',
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
  'A04MA',
  'A01EA',
  'A00PG',
  'A012A',
  'A012G',
  'A0BAV',
  'A012J',
  'A012B',
  'A00PH',
  'A00PX',
  'A00PY',
  'A00PZ',
  'A01JT',
  'A00KX',
  'A00LE',
  'A00KE',
  'A01BQ',
  'A01BR',
  'A01EE',
  'A01EP',
  'A01EY',
  'A01FH',
  'A01FM',
  'A01DT',
  'A01FN',
  'A0DQS',
  'A00JA',
  'A00JB',
  'A0DMM',
  'A01DX',
  'A01DY',
  'A001D',
  'A000N',
  'A000R',
  'A000L',
  'A00HQ',
  'A00HY',
  'A031G',
  'A031K'
]);

export const Matrix = z.enum(
  [...MatrixDeprecated.options, ...MatrixEffective.options],
  {
    errorMap: () => ({
      message: 'Veuillez renseigner la matrice.'
    })
  }
);

export type Matrix = z.infer<typeof Matrix>;

export const MatrixList = MatrixEffective.options.sort((a, b) =>
  MatrixLabels[a].localeCompare(MatrixLabels[b])
);
