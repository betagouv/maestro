import { Prescription } from '../../shared/schema/Prescription/Prescription';
import db from './db';

const prescriptionsTable = 'prescriptions';

export const Prescriptions = () => db<Prescription>(prescriptionsTable);

const findUnique = async (id: string): Promise<Prescription | undefined> => {
  console.info('Find prescription by id', id);
  return Prescriptions().where({ id }).first();
};

const findMany = async (programmingPlanId: string): Promise<Prescription[]> => {
  console.info('Find prescriptions by programming plan id', programmingPlanId);
  return Prescriptions().where({ programmingPlanId });
};

const insert = async (prescription: Prescription): Promise<void> => {
  console.info('Insert prescription with id', prescription.id);
  await Prescriptions().insert(prescription);
};

const insertMany = async (prescriptions: Prescription[]): Promise<void> => {
  console.info('Insert multiple prescriptions', prescriptions.length);
  await Prescriptions().insert(prescriptions);
};

const update = async (prescription: Prescription): Promise<void> => {
  console.info('Update prescription with id', prescription.id);
  await Prescriptions().where({ id: prescription.id }).update(prescription);
};

const deleteMany = async (ids: string[]): Promise<void> => {
  console.info('Delete prescriptions with ids', ids);
  await Prescriptions().whereIn('id', ids).delete();
};

export default {
  findUnique,
  findMany,
  insert,
  insertMany,
  update,
  deleteMany,
};
