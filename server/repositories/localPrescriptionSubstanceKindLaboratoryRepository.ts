import { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  LocalPrescriptionSubstanceKindLaboratory,
  type SubstanceKindLaboratory
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { z } from 'zod';
import { knexInstance as db } from './db';

export const localPrescriptionSubstanceKindsLaboratoriesTable =
  'local_prescription_substance_kinds_laboratories';

const LocalPrescriptionSubstanceKindLaboratoryDbo = z.object({
  ...LocalPrescriptionSubstanceKindLaboratory.shape,
  department: z.union([Department, z.literal('None')])
});

type LocalPrescriptionSubstanceKindLaboratoryDbo = z.infer<
  typeof LocalPrescriptionSubstanceKindLaboratoryDbo
>;

export const LocalPrescriptionSubstanceKindsLaboratories = (transaction = db) =>
  transaction<LocalPrescriptionSubstanceKindLaboratoryDbo>(
    localPrescriptionSubstanceKindsLaboratoriesTable
  );

const updateMany = async (
  localPrescription: Omit<LocalPrescriptionKey, 'companySiret'>,
  substanceKindsLaboratories: SubstanceKindLaboratory[]
): Promise<void> => {
  console.info('Update local prescription laboratories', localPrescription);
  await db.transaction(async (transaction) => {
    await LocalPrescriptionSubstanceKindsLaboratories(transaction)
      .where({
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        department: localPrescription.department ?? 'None'
      })
      .forUpdate();
    await LocalPrescriptionSubstanceKindsLaboratories(transaction)
      .where({
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        department: localPrescription.department ?? 'None'
      })
      .delete();
    if (substanceKindsLaboratories.length > 0) {
      await LocalPrescriptionSubstanceKindsLaboratories(transaction).insert(
        substanceKindsLaboratories.map((substanceKindLaboratory) => ({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          department: localPrescription.department ?? 'None',
          substanceKind: substanceKindLaboratory.substanceKind,
          laboratoryId: substanceKindLaboratory.laboratoryId
        }))
      );
    }
  });
};

interface AgreementScope {
  region: Region;
  department: Department | null;
  programmingPlanId: string;
}

const findAgreementScopes = async (
  laboratoryId: string,
  programmingSubPlanId: string,
  substanceKind: SubstanceKind
): Promise<AgreementScope[]> => {
  console.info('Find laboratory agreement scopes', laboratoryId);
  const rows = (await LocalPrescriptionSubstanceKindsLaboratories()
    .join(
      'prescriptions',
      'prescriptions.id',
      `${localPrescriptionSubstanceKindsLaboratoriesTable}.prescription_id`
    )
    .where(
      `${localPrescriptionSubstanceKindsLaboratoriesTable}.laboratory_id`,
      laboratoryId
    )
    .andWhere(
      `${localPrescriptionSubstanceKindsLaboratoriesTable}.substance_kind`,
      substanceKind
    )
    .andWhere('prescriptions.programming_sub_plan_id', programmingSubPlanId)
    .distinct(
      `${localPrescriptionSubstanceKindsLaboratoriesTable}.region`,
      `${localPrescriptionSubstanceKindsLaboratoriesTable}.department`,
      'prescriptions.programming_plan_id'
    )) as unknown as {
    region: Region;
    department: Department | 'None';
    programmingPlanId: string;
  }[];

  return rows.map((row) => ({
    region: row.region,
    department: row.department === 'None' ? null : row.department,
    programmingPlanId: row.programmingPlanId
  }));
};

export default {
  updateMany,
  findAgreementScopes
};
