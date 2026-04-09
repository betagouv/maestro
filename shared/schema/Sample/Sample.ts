import { isNil, uniq } from 'lodash-es';

import { z } from 'zod';
import type { CheckFn } from 'zod/v4/core';
import { Department } from '../../referential/Department';
import { LegalContext } from '../../referential/LegalContext';
import { Matrix, MatrixList } from '../../referential/Matrix/Matrix';
import {
  MatrixKind,
  OtherMatrixKind
} from '../../referential/Matrix/MatrixKind';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { Region } from '../../referential/Region';
import { SSD2Id } from '../../referential/Residue/SSD2Id';
import { Stage } from '../../referential/Stage';
import { maestroDateRefined } from '../../utils/date';
import { isDefined } from '../../utils/utils';
import { checkSchema } from '../../utils/zod';
import { Company } from '../Company/Company';
import { Geolocation } from '../Geolocation/Geolocation';
import {
  Context,
  OutsideProgrammingPlanContext,
  ProgrammingPlanContext
} from '../ProgrammingPlan/Context';
import {
  ProgrammingPlanAnalysisPermissionRole,
  ProgrammingPlanKind
} from '../ProgrammingPlan/ProgrammingPlanKind';
import { SpecificData, UnknownValue } from '../SpecificData/SpecificData';
import { hasPermission, Sampler, type UserBase } from '../User/User';
import type { UserRole } from '../User/UserRole';
import { SampleCompliance } from './SampleCompliance';
import { PartialSampleItem, SampleItem } from './SampleItem';
import { SampleStatus } from './SampleStatus';
import { SampleStep } from './SampleStep';

export const SampleContextData = z.object({
  id: z.guid(),
  sampler: Sampler,
  additionalSampler: Sampler.nullish(),
  geolocation: Geolocation.nullish(),
  department: Department.nullish(),
  parcel: z.string().nullish(),
  programmingPlanId: z.guid(),
  programmingPlanKind: ProgrammingPlanKind,
  context: Context,
  legalContext: LegalContext,
  company: Company.nullish(),
  companyOffline: z.string().nullish(),
  resytalId: z.string().nullish(),
  notesOnCreation: z.string().nullish(),
  step: SampleStep,
  status: SampleStatus,
  specificData: SpecificData
});

export const SampleMatrixData = z.object({
  matrixKind: z.union([MatrixKind, OtherMatrixKind], {
    error: (issue) =>
      isNil(issue.input)
        ? 'Veuillez renseigner la catégorie de matrice programmée.'
        : issue.message
  }),
  matrix: z.union([Matrix, z.string().nonempty()], {
    error: (issue) =>
      isNil(issue.input) ? 'Veuillez renseigner la matrice.' : issue.message
  }),
  stage: Stage,
  notesOnMatrix: z.string().nullish(),
  prescriptionId: z.guid().nullish(),
  monoSubstances: z.array(SSD2Id).nullish(),
  multiSubstances: z.array(SSD2Id).nullish(),
  documentIds: z.array(z.guid()).nullish(),
  specificData: SpecificData
});

export const sampleMatrixCheck: CheckFn<{
  matrixKind: MatrixKind | 'Other';
  matrix: Matrix | string;
}> = (ctx) => {
  if (
    ctx.value.matrixKind !== 'Other' &&
    !Matrix.safeParse(ctx.value.matrix).success
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'invalid_value',
      values: MatrixList,
      path: ['matrix']
    });
  }
};

const unknownValueCheck: CheckFn<{
  specificData: SpecificData;
}> = (ctx) => {
  const specificData = ctx.value.specificData;

  Object.entries(specificData).forEach(([key, value]) => {
    if (value === UnknownValue) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: `Veuillez renseigner le descripteur manquant.`,
        path: ['specificData', key]
      });
    }
  });
};

export const sampleSendCheck: CheckFn<
  Pick<SampleBase, 'sampledDate' | 'sentAt' | 'specificData'>
> = (ctx) => {
  if (
    !isNil(ctx.value.sampledDate) &&
    !isNil(ctx.value.sentAt) &&
    ctx.value.sampledDate > ctx.value.sentAt.toISOString().slice(0, 10)
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message:
        "La date de prélèvement ne peut pas être postérieure à la date d'envoi au laboratoire.",
      path: ['sampledDate']
    });
  }

  unknownValueCheck(ctx);
};

export const prescriptionSubstancesCheck: CheckFn<{
  prescriptionId?: string | null;
  monoSubstances?: SSD2Id[] | null;
  multiSubstances?: SSD2Id[] | null;
}> = (ctx) => {
  if (!isDefined(ctx.value.prescriptionId)) {
    if (isNil(ctx.value.monoSubstances) && isNil(ctx.value.multiSubstances)) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message:
          'Veuillez préciser les substances mono-résidu et/ou multi-résidus à analyser.',
        path: ['substances']
      });
    }
    if (
      !isNil(ctx.value.monoSubstances) &&
      ctx.value.monoSubstances.length === 0
    ) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: 'Veuillez renseigner au moins une substance mono-résidu.',
        path: ['monoSubstances']
      });
    }
  }
};

export const sampleItemSealIdCheck: CheckFn<{
  items: PartialSampleItem[];
}> = (ctx) => {
  const sealsIds = ctx.value.items
    .map((item) => item.sealId)
    .filter((sealId) => !isNil(sealId) && sealId.trim() !== '');
  if (uniq(sealsIds).length !== sealsIds.length) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message: 'Les numéros de scellés doivent être uniques.',
      path: ['items']
    });
  }
};

export const SampleItemsDataChecked = checkSchema(
  z.object({
    sampledDate: maestroDateRefined,
    sampledTime: z.string().regex(/^\d{2}:\d{2}$/, {
      error: () => "L'heure de prélèvement est invalide."
    }),
    items: z
      .array(SampleItem)
      .min(1, { message: 'Veuillez renseigner au moins un échantillon.' }),
    notesOnItems: z.string().nullish()
  }),
  sampleItemSealIdCheck
);

export const SampleOwnerData = z.object({
  ownerFirstName: z.string().nullish(),
  ownerLastName: z.string().nullish(),
  ownerEmail: z.email("L'adresse email du détenteur est invalide.").nullish(),
  ownerAgreement: z.boolean({
    error: (issue) =>
      isNil(issue.input)
        ? "Veuillez renseigner l'accord du détenteur."
        : issue.message
  }),
  notesOnOwnerAgreement: z.string().nullish()
});

const PartialSampleMatrixData = z.object({
  ...SampleMatrixData.partial().shape,
  matrixKind: z.union([MatrixKind, OtherMatrixKind]).nullish(),
  matrix: z.union([Matrix, z.string().nonempty()]).nullish(),
  stage: Stage.nullish(),
  specificData: SpecificData
});

export const PartialSampleToCreate = z.object({
  ...SampleContextData.partial().required({
    id: true,
    programmingPlanId: true,
    programmingPlanKind: true,
    step: true,
    status: true,
    sampler: true
  }).shape,
  ...PartialSampleMatrixData.shape,
  ...z.object(SampleItemsDataChecked.shape).partial().shape,
  ...SampleOwnerData.partial().shape,
  items: z.array(PartialSampleItem).nullish()
});

export const SampleToCreate = z.object({
  ...SampleContextData.shape,
  ...SampleMatrixData.shape,
  ...SampleItemsDataChecked.shape,
  ...SampleOwnerData.shape
});

export const CreatedSampleData = z.object({
  reference: z.string(),
  region: Region,
  createdAt: z.coerce.date(),
  lastUpdatedAt: z.coerce.date()
});

export const SampleComplianceData = z.object({
  compliance: SampleCompliance.nullish(),
  notesOnCompliance: z.string().nullish()
});

export const PartialSample = PartialSampleToCreate.extend({
  ...CreatedSampleData.shape,
  ...SampleComplianceData.partial().shape,
  sentAt: z.coerce.date().nullish()
});

export const SampleBase = SampleToCreate.extend({
  ...CreatedSampleData.shape,
  ...SampleComplianceData.shape,
  geolocation: Geolocation,
  department: Department,
  company: Company,
  items: z.array(SampleItem),
  sentAt: z.coerce.date().nullish()
});

const sampleItemsCheck: CheckFn<{ items: SampleItem[] }> = (ctx) => {
  ctx.value.items.forEach((item, index) => {
    if (item.itemNumber !== 1 && !isNil(item.complianceOverride)) {
      ctx.issues.push({
        input: ctx.value,
        code: 'invalid_value',
        values: MatrixList,
        path: ['items', index, 'complianceOverride']
      });
    }
  });
};

export const SampleChecked = checkSchema(
  SampleBase,
  prescriptionSubstancesCheck,
  sampleMatrixCheck,
  sampleItemsCheck
);

export type SampleContextData = z.infer<typeof SampleContextData>;
export type SampleMatrixData = z.infer<typeof SampleMatrixData>;
export type SampleItemsDataChecked = z.infer<typeof SampleItemsDataChecked>;
export type SampleOwnerData = z.infer<typeof SampleOwnerData>;
export type CreatedSampleData = z.infer<typeof CreatedSampleData>;
export type SampleComplianceData = z.infer<typeof SampleComplianceData>;
export type PartialSampleToCreate = z.infer<typeof PartialSampleToCreate>;
export type PartialSample = z.infer<typeof PartialSample>;
export type SampleToCreate = z.infer<typeof SampleToCreate>;
export type SampleBase = z.infer<typeof SampleBase>;
export type SampleChecked = z.infer<typeof SampleChecked>;

export const isCreatedPartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
): partialSample is PartialSample =>
  partialSample !== undefined &&
  CreatedSampleData.safeParse(partialSample).success;

export const isProgrammingPlanSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => ProgrammingPlanContext.safeParse(partialSample?.context).success;

export const isOutsideProgrammingPlanSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => OutsideProgrammingPlanContext.safeParse(partialSample?.context).success;

export const getSampleMatrixLabel = (
  partialSample: PartialSample | PartialSampleToCreate
) =>
  partialSample.matrixKind === OtherMatrixKind.value
    ? (partialSample.matrix ?? '')
    : partialSample.matrix
      ? MatrixLabels[partialSample.matrix as Matrix]
      : '';

export const SamplePermission = z.enum(['performAnalysis']);

export type SamplePermission = z.infer<typeof SamplePermission>;

export const hasSamplePermission = (
  user: Pick<UserBase, 'region'>,
  userRole: UserRole,
  sample: Pick<SampleBase, 'region' | 'programmingPlanKind'>
): Record<SamplePermission, boolean> => ({
  performAnalysis:
    hasPermission(userRole, 'performAnalysis') &&
    sample.region === user.region &&
    ProgrammingPlanAnalysisPermissionRole[sample.programmingPlanKind] ===
      userRole
});
