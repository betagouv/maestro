import { isNil, omit, omitBy } from 'lodash-es';
import { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import type { FindDocumentOptions } from 'maestro-shared/schema/Document/FindDocumentOptions';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';
import { sampleDocumentsTable } from './sampleRepository';

const documentsTable = 'documents';
export const documentProgrammingPlansTable = 'document_programming_plans';

export const Documents = () => db<DocumentChecked>(documentsTable);

const findUnique = async (id: string): Promise<DocumentChecked | undefined> => {
  console.info('Find document', id);
  return Documents()
    .select(
      `${documentsTable}.*`,
      db.raw(
        `coalesce(array_agg(${documentProgrammingPlansTable}.programming_plan_id) filter (where ${documentProgrammingPlansTable}.programming_plan_id is not null), '{}') as programming_plan_ids`
      )
    )
    .where({ id })
    .leftJoin(
      documentProgrammingPlansTable,
      `${documentsTable}.id`,
      `${documentProgrammingPlansTable}.document_id`
    )
    .groupBy('id')
    .first()
    .then((_) => _ && DocumentChecked.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindDocumentOptions
): Promise<DocumentChecked[]> => {
  console.info('Find documents', omitBy(omit(findOptions, 'sampleId'), isNil));
  return Documents()
    .select(
      `${documentsTable}.*`,
      db.raw(
        `coalesce(array_agg(${documentProgrammingPlansTable}.programming_plan_id) filter (where ${documentProgrammingPlansTable}.programming_plan_id is not null), '{}') as programming_plan_ids`
      )
    )
    .leftJoin(
      documentProgrammingPlansTable,
      `${documentsTable}.id`,
      `${documentProgrammingPlansTable}.document_id`
    )
    .groupBy('id')
    .modify((query) => {
      if (findOptions.sampleId) {
        query
          .join(
            sampleDocumentsTable,
            `${documentsTable}.id`,
            `${sampleDocumentsTable}.document_id`
          )
          .where('sample_id', '=', findOptions.sampleId);
      }
      if (findOptions.kinds) {
        query.whereIn('kind', findOptions.kinds);
      }
      if (findOptions.year) {
        query.where('year', '=', findOptions.year);
      }
      if (findOptions.programmingPlanIds) {
        if (findOptions.includeNoProgrammingPlan) {
          query.where(function () {
            this.whereIn(
              `${documentProgrammingPlansTable}.programming_plan_id`,
              findOptions.programmingPlanIds!
            ).orWhereNull(
              `${documentProgrammingPlansTable}.programming_plan_id`
            );
          });
        } else {
          query.whereIn(
            `${documentProgrammingPlansTable}.programming_plan_id`,
            findOptions.programmingPlanIds
          );
        }
      } else {
        query.whereNull(`${documentProgrammingPlansTable}.programming_plan_id`);
      }
    })
    .then((documents) =>
      documents.map((_: DocumentChecked) =>
        DocumentChecked.parse(omitBy(_, isNil))
      )
    );
};

const insert = async (
  document: DocumentChecked,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  console.info('Insert document', document.id);
  await trx
    .insertInto('documents')
    .values(omit(document, 'programmingPlanIds'))
    .execute();
  if (document.programmingPlanIds?.length) {
    const documentProgrammingPlans = document.programmingPlanIds.map(
      (programmingPlanId) => ({
        documentId: document.id,
        programmingPlanId
      })
    );
    await trx
      .insertInto('documentProgrammingPlans')
      .values(documentProgrammingPlans)
      .execute();
  }
};

const update = async (
  document: DocumentChecked,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  console.info('Update document', document.id);
  await trx
    .updateTable('documents')
    .set(omit(document, 'programmingPlanIds'))
    .where('id', '=', document.id)
    .execute();
  await trx
    .deleteFrom('documentProgrammingPlans')
    .where('documentId', '=', document.id)
    .execute();
  if (document.programmingPlanIds?.length) {
    const documentProgrammingPlans = document.programmingPlanIds.map(
      (programmingPlanId) => ({
        documentId: document.id,
        programmingPlanId
      })
    );
    await trx
      .insertInto('documentProgrammingPlans')
      .values(documentProgrammingPlans)
      .execute();
  }
};

const deleteOne = async (id: string): Promise<void> => {
  console.info('Delete document', id);
  await Documents().where({ id }).delete();
};

export const documentRepository = {
  insert,
  update,
  findMany,
  findUnique,
  deleteOne
};
