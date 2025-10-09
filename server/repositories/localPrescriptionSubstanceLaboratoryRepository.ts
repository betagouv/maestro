import { Department } from 'maestro-shared/referential/Department';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  LocalPrescriptionLaboratory,
  SubstanceLaboratory
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionLaboratory';
import { z } from 'zod';
import { knexInstance as db } from './db';

export const localPrescriptionSubstancesLaboratoriesTable =
  'local_prescription_substances_laboratories';

const LocalPrescriptionSubstanceLaboratoryDbo = z.object({
  ...LocalPrescriptionLaboratory.shape,
  department: z.union([Department, z.literal('None')])
});

type LocalPrescriptionSubstanceLaboratoryDbo = z.infer<
  typeof LocalPrescriptionSubstanceLaboratoryDbo
>;

export const LocalPrescriptionSubstancesLaboratories = (transaction = db) =>
  transaction<LocalPrescriptionSubstanceLaboratoryDbo>(
    localPrescriptionSubstancesLaboratoriesTable
  );

const updateMany = async (
  localPrescription: Omit<LocalPrescriptionKey, 'companySiret'>,
  substancesLaboratories: SubstanceLaboratory[]
): Promise<void> => {
  console.info('Update local prescription laboratories', localPrescription);
  await db.transaction(async (transaction) => {
    await LocalPrescriptionSubstancesLaboratories(transaction)
      .where({
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        department: localPrescription.department ?? 'None'
      })
      .forUpdate();
    await LocalPrescriptionSubstancesLaboratories(transaction)
      .where({
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        department: localPrescription.department ?? 'None'
      })
      .delete();
    if (substancesLaboratories.length > 0) {
      await LocalPrescriptionSubstancesLaboratories(transaction).insert(
        substancesLaboratories.map((substanceLaboratory) => ({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          department: localPrescription.department ?? 'None',
          substance: substanceLaboratory.substance,
          laboratoryId: substanceLaboratory.laboratoryId
        }))
      );
    }
  });
};

export default {
  updateMany
};
