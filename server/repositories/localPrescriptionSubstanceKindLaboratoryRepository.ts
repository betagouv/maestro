import { Department } from 'maestro-shared/referential/Department';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  LocalPrescriptionSubstanceKindLaboratory,
  SubstanceKindLaboratory
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
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

export default {
  updateMany
};
