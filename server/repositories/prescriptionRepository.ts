import { Knex } from 'knex';
import { default as fp, default as _, isArray } from 'lodash';
import {
  FindPrescriptionOptions,
  FindPrescriptionOptionsInclude,
} from '../../shared/schema/Prescription/FindPrescriptionOptions';
import { Prescription } from '../../shared/schema/Prescription/Prescription';
import db from './db';
import { prescriptionCommentsTable } from './prescriptionCommentRepository';

const prescriptionsTable = 'prescriptions';

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
    FindPrescriptionOptionsInclude,
    (query: Knex.QueryBuilder) => void
  > = {
    comments: (query) => {
      query
        .select(
          db.raw(
            `case 
              when count(${prescriptionCommentsTable}.id) > 0 
                then array_agg(
                  json_build_object(
                    'id', ${prescriptionCommentsTable}.id, 
                    'comment', ${prescriptionCommentsTable}.comment, 
                    'createdAt', ${prescriptionCommentsTable}.created_at, 
                    'createdBy', ${prescriptionCommentsTable}.created_by
                  )
                ) 
              else '{}' end as comments`
          )
        )
        .leftJoin(
          prescriptionCommentsTable,
          `${prescriptionCommentsTable}.prescription_id`,
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
      joins[include as FindPrescriptionOptionsInclude](query);
    });
  };
};

const insert = async (prescription: Prescription): Promise<void> => {
  console.info('Insert prescription with id', prescription.id);
  await Prescriptions().insert(prescription);
};

const insertMany = async (prescriptions: Prescription[]): Promise<void> => {
  console.info('Insert multiple prescriptions', prescriptions.length);
  if (prescriptions.length > 0) {
    await Prescriptions().insert(prescriptions);
  }
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
