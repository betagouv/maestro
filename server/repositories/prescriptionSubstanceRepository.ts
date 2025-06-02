import { isNil, omitBy } from 'lodash-es';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { knexInstance as db } from './db';

export const prescriptionSubstanceTable = 'prescription_substances';

export const PrescriptionSubstances = () =>
  db<PrescriptionSubstance>(prescriptionSubstanceTable);

const findMany = async (
  prescriptionId: string
): Promise<PrescriptionSubstance[]> => {
  console.info('Find prescription substances', prescriptionId);
  return PrescriptionSubstances()
    .where({ prescriptionId })
    .then((prescriptionSubstances) =>
      prescriptionSubstances.map((_: PrescriptionSubstance) =>
        PrescriptionSubstance.parse(omitBy(_, isNil))
      )
    );
};

const insert = async (
  prescriptionSubstance: PrescriptionSubstance
): Promise<void> => {
  console.info(
    'Insert prescription substance',
    prescriptionSubstance.prescriptionId,
    prescriptionSubstance.substance
  );
  await PrescriptionSubstances().insert(prescriptionSubstance);
};

const insertMany = async (
  prescriptionSubstances: PrescriptionSubstance[]
): Promise<void> => {
  console.info(
    'Insert prescription substances',
    prescriptionSubstances.map((_) => _.prescriptionId)
  );
  if (prescriptionSubstances.length > 0) {
    await PrescriptionSubstances().insert(prescriptionSubstances);
  }
};

const deleteMany = async (prescriptionId: string): Promise<void> => {
  console.info('Delete prescription substances', prescriptionId);
  await PrescriptionSubstances().where({ prescriptionId }).delete();
};

export default {
  findMany,
  insert,
  insertMany,
  deleteMany
};
