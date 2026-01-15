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
  PROD_3: 'I', //'Inconnu (BV, OV ou CP)',
  //FIXME EDI n'existe pas
  PROD_4: '' //'Boucherie (PC ou EQ)'
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
