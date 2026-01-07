import { MatrixEffective } from 'maestro-shared/referential/Matrix/Matrix';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import z from 'zod';

export const sigleContexteInterventionValidator = z.enum([
  '2026_RPDA_PVOL',
  '2026_RPDA_PBOV'
]);
export const SigleContexteIntervention: Record<
  Exclude<ProgrammingPlanKind, 'PPV'>,
  z.infer<typeof sigleContexteInterventionValidator>
> = {
  DAOA_BREEDING: '2026_RPDA_PVOL',
  DAOA_SLAUGHTER: '2026_RPDA_PBOV'
};

export const siglePlanAnalyseValidator = z.enum(['RestPest_DAOA']);

export const SiglePlanAnalyse: Record<
  Exclude<ProgrammingPlanKind, 'PPV'>,
  z.infer<typeof siglePlanAnalyseValidator>
> = {
  DAOA_BREEDING: 'RestPest_DAOA',
  DAOA_SLAUGHTER: 'RestPest_DAOA'
};

export type NotPPVMatrix = Exclude<
  z.infer<typeof MatrixEffective>,
  | 'A00GZ'
  | 'A00HF'
  | 'A00RT'
  | 'A00JD'
  | 'A01LC'
  | 'A001P'
  | 'A001R'
  | 'A00DL'
  | 'A001N'
  | 'A001M'
  | 'A00FN'
  | 'A010V'
  | 'A03NJ'
  | 'A00TQ'
  | 'A00FV'
  | 'A00FY'
  | 'A00FX'
  | 'A015M'
  | 'A00JM'
  | 'A00JP'
  | 'A00JR'
  | 'A00JZ'
  | 'A00JN'
  | 'A00LD'
  | 'A00XB'
  | 'A00XD'
  | 'A00XA'
  | 'A00YE'
  | 'A017L'
  | 'A00YF'
  | 'A00YQ'
  | 'A00VV'
  | 'A00VX'
  | 'A00YP'
  | 'A00VT'
  | 'A00XZ'
  | 'A00XV'
  | 'A04MA'
  | 'A01EA'
  | 'A00PG'
  | 'A012A'
  | 'A012G'
  | 'A0BAV'
  | 'A012J'
  | 'A012B'
  | 'A00PH'
  | 'A00PX'
  | 'A00PY'
  | 'A00PZ'
  | 'A01JT'
  | 'A00KX'
  | 'A00LE'
  | 'A00KE'
  | 'A01BQ'
  | 'A01BR'
  | 'A01EE'
  | 'A01EP'
  | 'A01EY'
  | 'A01FH'
  | 'A01FM'
  | 'A01DT'
  | 'A01FN'
  | 'A0DQS'
  | 'A00JA'
  | 'A00JB'
  | 'A0DMM'
  | 'A01DX'
  | 'A01DY'
  | 'A001D'
  | 'A000N'
  | 'A000R'
  | 'A000L'
  | 'A00HQ'
  | 'A00HY'
  | 'A031G'
  | 'A031K'
  | 'A01QV#F28.A0C0S'
  | 'A01RG#F28.A0C0S'
  | 'A01RJ#F28.A0C0S'
  | 'A01RL#F28.A0C0S'
>;
export const sigleMatrixValidator = z.enum(['FOIE_BV']);

export const SigleMatrix: Record<
  NotPPVMatrix,
  z.infer<typeof sigleMatrixValidator>
> = {
  //   'A01SN#F26.A07XE': "Viande d'autres volailles non transformée",
  // FIXME à corriger
  'A01SN#F26.A07XE': 'FOIE_BV',
  //   'A01SP#F28.A0C0S': 'Viande de poulets de chair non transformée',
  // FIXME à corriger
  'A01SP#F28.A0C0S': 'FOIE_BV',
  //   'A01SP#F31.A0CSD': 'Viande de poule de réforme non transformée',
  // FIXME à corriger
  'A01SP#F31.A0CSD': 'FOIE_BV',
  //   'A01SQ#F28.A0C0S': 'Viande de dinde non transformée',
  // FIXME à corriger
  'A01SQ#F28.A0C0S': 'FOIE_BV',
  'A01XF#F28.A0C0S': 'FOIE_BV'
};
