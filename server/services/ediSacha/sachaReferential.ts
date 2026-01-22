import { AnimalKindsByProgrammingPlanKind } from 'maestro-shared/referential/AnimalKind';
import { AnimalSex } from 'maestro-shared/referential/AnimalSex';
import { MatrixEffective } from 'maestro-shared/referential/Matrix/Matrix';
import { ProductionKindsByProgrammingPlanKind } from 'maestro-shared/referential/ProductionKind';
import { SpeciesByProgrammingPlanKind } from 'maestro-shared/referential/Species';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
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
  //FIXME EDI attention valeur qui change en fonction de l'analyse à faire RestPest_DAOA (multi-résidu) VS RestPest_DAOA_CU (cuivre)
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
  | 'A00RP'
  | 'A01DJC'
  | 'A0DMR'
  | 'A0DRA'
  | 'A01KC'
  | 'A0CGB'
  | 'A01LQ'
  | 'A00QH'
  | 'A00QQ'
  | 'A00RL'
  | 'A01AJ'
  | 'A004C'
  | 'A0DZB'
  | 'A0DKS'
  | 'A000Z'
  | 'A00HM'
  | 'A01AB'
  | 'A015L'
  | 'A0DKT'
  | 'A01GT'
  | 'A00ZY'
  | 'A00LP'
  | 'A01KN'
  | 'A0DVH'
  | 'A00QK'
  | 'A0DQR'
  | 'A00SB'
  | 'A01DF'
  | 'A019J'
  | 'A0CHE'
  | 'A015K'
  | 'A0DLR'
  | 'A01BX'
  | 'A00ZZ'
  | 'A01JX'
  | 'A00QL'
  | 'A01JV'
  | 'A003M'
  | 'A010M'
  | 'A0DCS'
  | 'A004Q'
  | 'A0DCT'
  | 'A00GN'
  | 'A002G'
  | 'A015J'
  | 'A002A'
  | 'A01DJ'
  | 'A00QZ'
  | 'A0CHF'
  | 'A0CYB'
  | 'A004S'
  | 'A002Y'
  | 'A0DQG'
  | 'A00DS'
  | 'A00MJ'
  | 'A0DPA'
  | 'A00VL'
  | 'A01LT'
  | 'A002E'
  | 'A0CGD'
  | 'A003Q'
  | 'A01HZ'
  | 'A003Z'
  | 'A003Y'
  | 'A00RA'
  | 'A0CYD'
  | 'A01HQ'
  | 'A00VN'
  | 'A0DEZ'
  | 'A0DDC'
  | 'A00LN'
  | 'A0DLD'
  | 'A0DCR'
  | 'A0CHH'
  | 'A00EC'
  | 'A00KT'
  | 'A0DFA'
  | 'A0DVG'
  | 'A016K'
  | 'A01HA'
  | 'A004P'
  | 'A0DPZ'
  | 'A01HR'
  | 'A001A'
  | 'A0CGK'
  | 'A010A'
  | 'A0DDD'
  | 'A00DA'
  | 'A176G'
  | 'A0DKR'
  | 'A0DPX'
  | 'A00VM'
  | 'A00QP'
  | 'A004L'
  | 'A0DQB'
  | 'A004A'
  | 'A00RS'
  | 'A0DQH'
  | 'A01GR'
  | 'A00RH'
  | 'A0DPS'
  | 'A01AF'
  | 'A0DEY'
  | 'A0DKV'
  | 'A170Q'
  | 'A001B'
  | 'A01KS'
  | 'A002Q'
  | 'A00RY'
  | 'A01KY'
  | 'A01KQ'
  | 'A00GQ'
  | 'A00SZ'
  | 'A0DRC'
  | 'A003N'
  | 'A00QE'
  | 'A0DBL'
  | 'A004B'
  | 'A004K'
  | 'A0DPL'
  | 'A012L'
  | 'A012Q'
  | 'A0DQV'
  | 'A0DPJ'
  | 'A01GF'
  | 'A015T'
  | 'A001K'
  | 'A01KX'
  | 'A00VF'
  | 'A002T'
  | 'A0DLT'
  | 'A170N'
  | 'A004J'
  | 'A000A'
  | 'A01GM'
  | 'A00VC'
  | 'A0DMQ'
  | 'A0DCQ'
  | 'A004D'
  | 'A001Z'
  | 'A0CGC'
  | 'A01LB'
  | 'A00DK'
  | 'A00DY'
  | 'A00VG'
  | 'A00RN'
  | 'A003L'
  | 'A0DQN'
  | 'A019H'
  | 'A00KH'
  | 'A01JM'
  | 'A0DPK'
  | 'A0CYC'
  | 'A000E'
  | 'A0DQJ'
  | 'A0DKX'
  | 'A00ED'
  | 'A01GS'
  | 'A170P'
  | 'A01LH'
  | 'A00SY'
  | 'A01AA'
  | 'A0CHG'
  | 'A000T'
  | 'A0CXQ'
  | 'A00QJ'
  | 'A0DVJ'
  | 'A0DCP'
  | 'A00QY'
  | 'A170R'
  | 'A00RB'
  | 'A00DD'
  | 'A00KJ'
  | 'A00ZX'
  | 'A00RQ'
  | 'A01LF'
  | 'A0DNX'
  | 'A00ZV'
  | 'A00MA'
  | 'A0DBK'
  | 'A01CB'
  | 'A00EM'
  | 'A01LR'
  | 'A001L'
  | 'A0F6P'
  | 'A00KN'
  | 'A010K'
  | 'A002K'
  | 'A170Z'
  | 'A0DQZ'
  | 'A01GX'
  | 'A01AC'
  | 'A0DCX'
  | 'A00RC'
  | 'A0DQD'
  | 'A00GM'
  | 'A00TA'
  | 'A0DCZ'
  | 'A00SH'
  | 'A0DNJ'
  | 'A01GZ'
  | 'A01GY'
  | 'A010N'
  | 'A0DEX'
  | 'A00VD'
  | 'A0DCN'
  | 'A003T'
  | 'A01GN'
  | 'A01LY'
  | 'A01GQ'
  | 'A015R'
  | 'A003K'
  | 'A00SR'
  | 'A0DPY'
  | 'A00VJ'
  | 'A170V'
  | 'A0DQA'
  | 'A0DNK'
  | 'A00VH'
  | 'A0F4Q'
  | 'A002P'
  | 'A0DLE'
  | 'A01KD'
  | 'A00QX'
  | 'A00LQ'
  | 'A002L'
  | 'A042B'
  | 'A0DVL'
  | 'A0DPN'
  | 'A0DQX'
  | 'A00GP'
  | 'A01CX'
  | 'A0DQY'
  | 'A012P'
  | 'A001Y'
  | 'A01LS'
  | 'A00LL'
  | 'A003B'
  | 'A003F'
  | 'A01GV'
  | 'A0BJZ'
  | 'A00ST'
  | 'A04KT'
  | 'A00YT'
  | 'A01LP'
  | 'A01LG'
  | 'A000D'
  | 'A010L'
  | 'A0DNZ'
  | 'A000B'
  | 'A00QV'
  | 'A000G'
  | 'A170S'
  | 'A0BB1'
  | 'A0BB0'
>;
export const sigleMatrixValidator = z.enum(['FOIE_BV']);

export const SigleMatrix: Record<
  NotPPVMatrix,
  z.infer<typeof sigleMatrixValidator>
> = {
  //   'A01SN#F26.A07XE': "Viande d'autres volailles non transformée",
  // FIXME EDI à corriger
  'A01SN#F26.A07XE': 'FOIE_BV',
  //   'A01SP#F28.A0C0S': 'Viande de poulets de chair non transformée',
  // FIXME EDI à corriger
  'A01SP#F28.A0C0S': 'FOIE_BV',
  //   'A01SP#F31.A0CSD': 'Viande de poule de réforme non transformée',
  // FIXME EDI à corriger
  'A01SP#F31.A0CSD': 'FOIE_BV',
  //   'A01SQ#F28.A0C0S': 'Viande de dinde non transformée',
  // FIXME EDI à corriger
  'A01SQ#F28.A0C0S': 'FOIE_BV',
  'A01XF#F28.A0C0S': 'FOIE_BV'
};

//  <Cle>100000000913</Cle><Sigle>SEX1</Sigle>
export const SigleSex: Record<AnimalSex, string> = {
  // SEX1: 'Mâle entier',
  SEX1: 'MALE',
  // SEX2: 'Mâle castré',
  SEX2: 'CASTR',
  // SEX3: 'Mâle non déterminé',
  SEX3: 'ML_ND',
  // SEX4: 'Femelle',
  SEX4: 'FEMEL',
  // SEX5: 'Sexe inconnu'
  SEX5: 'INDETERM'
};

export const SigleAnimalKind = {
  // TYPEA1: 'Veau < 6 mois',
  TYPEA1: 'VES6',
  // TYPEA2: 'Jeune bovin entre 6 et 24 mois',
  TYPEA2: 'BV6I24',
  // TYPEA3: 'Bovin > 24 mois hors vache de réforme',
  TYPEA3: 'BVAUT',
  // TYPEA4: 'Vache de réforme',
  TYPEA4: 'VAREF'
} as const satisfies Record<
  (typeof AnimalKindsByProgrammingPlanKind)['DAOA_SLAUGHTER'][number],
  string
>;

export const SigleProductionKind = {
  PROD_1: 'A', //'Allaitant',
  PROD_2: 'L', //'Laitier',
  PROD_3: 'I', //'Inconnu',
  //FIXME EDI n'existe pas
  PROD_4: '' //'Boucherie'
} as const satisfies Record<
  (typeof ProductionKindsByProgrammingPlanKind)['DAOA_SLAUGHTER'][number],
  string
>;

export const SigleSpecies = {
  ESP7: 'POULCHA', //'Poulet de chair',
  ESP8: 'POULREF', //'Poule de réforme',
  ESP10: 'AVIDIN', //'Dinde',
  //FIXME EDI n'existe pas
  ESP20: '' //'Autre volaille'
} as const satisfies Record<
  (typeof SpeciesByProgrammingPlanKind)['DAOA_BREEDING'][number],
  string
>;

export const mapping = {
  DAOA_SLAUGHTER: {
    sex: {
      sigle: 'SEX1',
      value: (v) => SigleSex[v]
    },
    animalIdentifier: {
      sigle: 'ID_ANIM',
      value: (v) => `${v}`
    },
    age: {
      sigle: 'AGEM',
      value: (v) => `${v}`
    },
    //FIXME EDI
    outdoorAccess: null,
    sampling: null,
    //FIXME EDI
    killingCode: null,
    animalKind: {
      sigle: 'TAXOEF',
      value: (v) => SigleAnimalKind[v]
    },
    productionKind: {
      sigle: 'TYP_PROD',
      value: (v) => SigleProductionKind[v]
    },

    //FIXME EDI
    seizure: null
  },
  DAOA_BREEDING: {
    animalIdentifier: {
      sigle: 'ID_ANIM',
      value: (v) => `${v}`
    },
    //FIXME EDI n'existe pas en jours, on met la date de naissance?
    age: null,
    species: {
      sigle: 'ESPPVO',
      value: (v) => SigleSpecies[v]
    },
    //FIXME EDI n'existe pas
    breedingMethod: null,
    //FIXME EDI
    outdoorAccess: null,
    sampling: null
  }
} as const satisfies {
  [k in Exclude<ProgrammingPlanKind, 'PPV'>]: {
    [s in MappingByProgrammingPlanKind<k>]: {
      sigle: string;
      value: (value: ValueType<k>[s]) => string;
    } | null;
  };
};

type MappingByProgrammingPlanKind<P extends ProgrammingPlanKind> = Exclude<
  keyof ValueType<P>,
  'programmingPlanKind'
>;

type ValueType<P extends ProgrammingPlanKind> = Extract<
  SampleMatrixSpecificData,
  { programmingPlanKind: P }
>;
