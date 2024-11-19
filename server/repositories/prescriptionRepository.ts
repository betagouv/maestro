import { default as fp } from 'lodash';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import { Prescription } from '../../shared/schema/Prescription/Prescription';
import db from './db';
export const prescriptionsTable = 'prescriptions';

export const Prescriptions = () => db<Prescription>(prescriptionsTable);

const findUnique = async (id: string): Promise<Prescription | undefined> => {
  console.info('Find prescription by id', id);
  return Prescriptions()
    .where({ id })
    .first()
    .then((_) => _ && Prescription.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (
  findOptions: FindPrescriptionOptions
): Promise<Prescription[]> => {
  console.info('Find prescriptions', fp.omitBy(findOptions, fp.isNil));
  return Prescriptions()
    .where(fp.omitBy(fp.omit(findOptions, 'stage'), fp.isNil))
    .modify((builder) => {
      if (findOptions.stage) {
        builder.where('stages', '@>', [findOptions.stage]);
      }
    })
    .then((prescriptions) =>
      prescriptions.map((_: Prescription) =>
        Prescription.parse(fp.omitBy(_, fp.isNil))
      )
    );
};

const insert = async (prescription: Prescription): Promise<void> => {
  console.info('Insert prescription with id', prescription.id);
  await Prescriptions().insert(prescription);
};

const update = async (prescription: Prescription): Promise<void> => {
  console.info('Update prescription with id', prescription.id);
  await Prescriptions().where({ id: prescription.id }).update(prescription);
};

const deleteOne = async (id: string): Promise<void> => {
  console.info('Delete prescription with id', id);
  await Prescriptions().where({ id }).delete();
};

export default {
  findUnique,
  findMany,
  insert,
  update,
  deleteOne,
};
