import { Knex } from 'knex';
import { default as fp, default as _, isArray } from 'lodash';
import {
  FindPrescriptionOptions,
  PrescriptionOptionsInclude,
} from '../../shared/schema/Prescription/FindPrescriptionOptions';
import { Prescription } from '../../shared/schema/Prescription/Prescription';
import db from './db';
import { prescriptionSubstanceTable } from './prescriptionSubstanceRepository';
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
    .select(`${prescriptionsTable}.*`)
    .where(fp.omitBy(fp.omit(findOptions, 'stage', 'includes'), fp.isNil))
    .modify((builder) => {
      if (findOptions.stage) {
        builder.where('stages', '@>', [findOptions.stage]);
      }
    })
    .modify(include(findOptions))
    .then((prescriptions) =>
      prescriptions.map((_: Prescription) =>
        Prescription.parse(fp.omitBy(_, fp.isNil))
      )
    );
};

const include = (opts?: FindPrescriptionOptions) => {
  const joins: Record<
    PrescriptionOptionsInclude,
    (query: Knex.QueryBuilder) => void
  > = {
    substanceCount: (query) => {
      query
        .select(
          db.raw(
            `count(substance_code) filter (where analysis_kind = 'Mono') as mono_analysis_count`
          ),
          db.raw(
            `count(substance_code) filter (where analysis_kind = 'Multi') as multi_analysis_count`
          )
        )
        .leftJoin(
          prescriptionSubstanceTable,
          'prescription_id',
          `${prescriptionsTable}.id`
        )
        .groupBy(`${prescriptionsTable}.id`);
    },
  };

  return (query: Knex.QueryBuilder) => {
    const includes = opts?.includes
      ? isArray(opts.includes)
        ? opts.includes
        : [opts.includes]
      : [];
    _.uniq(includes).forEach((include) => {
      joins[include as PrescriptionOptionsInclude](query);
    });
  };
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
