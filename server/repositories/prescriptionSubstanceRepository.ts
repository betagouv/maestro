import { isNil, omit, omitBy } from 'lodash-es';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { z } from 'zod';
import { knexInstance as db } from './db';
import { substancesTable } from './substanceRepository';

export const prescriptionSubstanceTable = 'prescription_substances';

const PrescriptionSubstanceDbo = PrescriptionSubstance.pick({
  prescriptionId: true,
  analysisMethod: true
}).merge(z.object({ substanceCode: z.string() }));

const PrescriptionSubstanceJoinedDbo = PrescriptionSubstanceDbo.merge(
  z.object({
    substanceLabel: z.string()
  })
);

type PrescriptionSubstanceDbo = z.infer<typeof PrescriptionSubstanceDbo>;
type PrescriptionSubstanceJoinedDbo = z.infer<
  typeof PrescriptionSubstanceJoinedDbo
>;

export const PrescriptionSubstances = () =>
  db<PrescriptionSubstanceDbo>(prescriptionSubstanceTable);

const findMany = async (
  prescriptionId: string
): Promise<PrescriptionSubstance[]> => {
  console.info('Find prescription substances', prescriptionId);
  return PrescriptionSubstances()
    .select(
      `${prescriptionSubstanceTable}.*`,
      `${substancesTable}.label as substanceLabel`
    )
    .join(
      substancesTable,
      `${prescriptionSubstanceTable}.substanceCode`,
      'code'
    )
    .where({ prescriptionId })
    .then((prescriptionSubstances) =>
      prescriptionSubstances.map(parsePrescriptionSubstance)
    );
};

const insert = async (
  prescriptionSubstance: PrescriptionSubstance
): Promise<void> => {
  console.info(
    'Insert prescription substance',
    prescriptionSubstance.prescriptionId,
    prescriptionSubstance.substance.code
  );
  await PrescriptionSubstances().insert(
    formatPrescriptionSubstance(prescriptionSubstance)
  );
};

const insertMany = async (
  prescriptionSubstances: PrescriptionSubstance[]
): Promise<void> => {
  console.info(
    'Insert prescription substances',
    prescriptionSubstances.map((_) => _.prescriptionId)
  );
  if (prescriptionSubstances.length > 0) {
    await PrescriptionSubstances().insert(
      prescriptionSubstances.map(formatPrescriptionSubstance)
    );
  }
};

const deleteMany = async (prescriptionId: string): Promise<void> => {
  console.info('Delete prescription substances', prescriptionId);
  await PrescriptionSubstances().where({ prescriptionId }).delete();
};

export const formatPrescriptionSubstance = (
  prescriptionSubstance: PrescriptionSubstance
): PrescriptionSubstanceDbo => ({
  ...omit(prescriptionSubstance, ['substance']),
  substanceCode: prescriptionSubstance.substance.code
});

const parsePrescriptionSubstance = (
  prescriptionSubstance: PrescriptionSubstanceJoinedDbo
): PrescriptionSubstance =>
  prescriptionSubstance &&
  PrescriptionSubstance.parse({
    ...omit(omitBy(prescriptionSubstance, isNil), [
      'substanceCode',
      'substanceLabel'
    ]),
    substance: {
      code: prescriptionSubstance.substanceCode,
      label: prescriptionSubstance.substanceLabel
    }
  });

export default {
  findMany,
  insert,
  insertMany,
  deleteMany
};
