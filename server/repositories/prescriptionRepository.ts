import type { Knex } from 'knex';
import { intersection, isArray, isNil, omit, omitBy, uniq } from 'lodash-es';
import type { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import type {
  FindPrescriptionOptions,
  PrescriptionOptionsInclude
} from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { PendingChangeVisibility } from 'maestro-shared/schema/User/UserRole';
import { knexInstance as db } from './db';
import { localPrescriptionSubstanceKindsLaboratoriesTable } from './localPrescriptionSubstanceKindLaboratoryRepository';
import { prescriptionSubstanceTable } from './prescriptionSubstanceRepository';
import { programmingPlansTable } from './programmingPlanRepository';
import { programmingSubPlansTable } from './programmingSubPlanRepository';
import { userRepository } from './userRepository';

export const prescriptionsTable = 'prescriptions';
const localPrescriptionsTable = 'local_prescriptions';
const localPrescriptionChangesTable = 'local_prescription_changes';

export const Prescriptions = () => db<Prescription>(prescriptionsTable);

const matrixKindsFilter = (
  findOptions: FindPrescriptionOptions
): MatrixKind[] | undefined => {
  const matrices = findOptions.matrices;
  if (!matrices?.length) {
    return undefined;
  }
  return (Object.keys(MatrixListByKind) as MatrixKind[]).filter((kind) =>
    matrices.some((matrix) => MatrixListByKind[kind].includes(matrix))
  );
};

const subPlanIdsFilter = async (
  findOptions: FindPrescriptionOptions
): Promise<ProgrammingSubPlanId[] | undefined> => {
  const filters: ProgrammingSubPlanId[][] = [];

  if (findOptions.programmingSubPlanIds?.length) {
    filters.push(findOptions.programmingSubPlanIds);
  }

  if (findOptions.subPlanStage || findOptions.coordinatorIds?.length) {
    const coordinatorIds = findOptions.coordinatorIds;
    const stages = coordinatorIds?.length
      ? uniq(
          (
            await userRepository.findMany({
              roles: ['NationalCoordinator'],
              disabled: false
            })
          )
            .filter((user) => coordinatorIds.includes(user.id))
            .flatMap((user) => user.stages)
        )
      : [];

    const subPlanIds = await db(programmingSubPlansTable)
      .select('id')
      .modify((builder) => {
        if (findOptions.subPlanStage) {
          builder.where('stages', '@>', [findOptions.subPlanStage]);
        }
        if (findOptions.coordinatorIds?.length) {
          builder.where('stages', '&&', stages);
        }
      })
      .then((rows: { id: string }[]) =>
        rows.map((row) => row.id as ProgrammingSubPlanId)
      );

    filters.push(subPlanIds);
  }

  return filters.length === 0
    ? undefined
    : filters.reduce((acc, ids) => intersection(acc, ids));
};

const effectiveChangeJoin = (
  kind: 'sampleCount' | 'laboratories',
  visibility: PendingChangeVisibility | undefined,
  localAlias: string
): [string, string[]] => [
  `left join lateral (
      select c.sample_count, c.substance_kinds_laboratories
      from ${localPrescriptionChangesTable} c
      where c.prescription_id = ${localAlias}.prescription_id
        and c.region = ${localAlias}.region
        and c.department = ${localAlias}.department
        and c.company_siret = ${localAlias}.company_siret
        and c.kind = ?
        and c.applied_at is null
        and (c.diffused_at is not null ${visibility?.echelon ? 'or c.echelon = ?' : ''})
      order by c.changed_at desc
      limit 1
    ) eff on true`,
  visibility?.echelon ? [kind, visibility.echelon] : [kind]
];

const scopedLocalPrescriptions = (
  builder: Knex.QueryBuilder,
  findOptions: FindPrescriptionOptions,
  alias: string
) => {
  builder.whereRaw(`${alias}.prescription_id = ${prescriptionsTable}.id`);
  if (findOptions.region) {
    builder.where(`${alias}.region`, findOptions.region);
  }
  if (findOptions.department) {
    builder.where(`${alias}.department`, findOptions.department);
  }
};

const applyLocalPrescriptionFilters = (
  builder: Knex.QueryBuilder,
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
) => {
  const seesUnapplied = visibility?.seesUnappliedChanges !== false;

  if (findOptions.withSampleCountOnly) {
    builder.where((where) => {
      where.whereExists((exists) => {
        exists
          .select(db.raw('1'))
          .from(`${localPrescriptionsTable} as lp`)
          .modify((query) => {
            if (seesUnapplied) {
              query.joinRaw(
                ...effectiveChangeJoin('sampleCount', visibility, 'lp')
              );
              query.whereRaw('coalesce(eff.sample_count, lp.sample_count) > 0');
            } else {
              query.where('lp.sample_count', '>', 0);
            }
            scopedLocalPrescriptions(query, findOptions, 'lp');
          });
      });

      if (seesUnapplied) {
        where.orWhereExists((exists) => {
          exists
            .select(db.raw('1'))
            .from(`${localPrescriptionChangesTable} as c`)
            .whereRaw(`c.prescription_id = ${prescriptionsTable}.id`)
            .where('c.kind', 'sampleCount')
            .whereNull('c.applied_at')
            .modify((query) => {
              query.where((sub) => {
                sub.whereNotNull('c.diffused_at');
                if (visibility?.echelon) {
                  sub.orWhere('c.echelon', visibility.echelon);
                }
              });
              if (findOptions.region) {
                query.where('c.region', findOptions.region);
              }
              if (findOptions.department) {
                query.where('c.department', findOptions.department);
              }
            });
        });
      }
    });
  }

  if (findOptions.laboratoryIds?.length) {
    const laboratoryIds = findOptions.laboratoryIds;
    builder.whereExists((exists) => {
      exists
        .select(db.raw('1'))
        .from(`${localPrescriptionSubstanceKindsLaboratoriesTable} as skl`)
        .whereRaw(`skl.prescription_id = ${prescriptionsTable}.id`)
        .whereIn('skl.laboratory_id', laboratoryIds)
        .modify((query) => {
          if (findOptions.region) {
            query.where('skl.region', findOptions.region);
          }
          if (findOptions.department) {
            query.where('skl.department', findOptions.department);
          }
        });
    });
  }

  if (findOptions.missingLaboratory) {
    builder.whereExists((exists) => {
      exists
        .select(db.raw('1'))
        .from(`${localPrescriptionsTable} as lp`)
        .where('lp.company_siret', 'None')
        .modify((query) => {
          scopedLocalPrescriptions(query, findOptions, 'lp');
          query.where((sub) => {
            sub.whereNotExists((inner) => {
              inner
                .select(db.raw('1'))
                .from(
                  `${localPrescriptionSubstanceKindsLaboratoriesTable} as skl`
                )
                .whereRaw('skl.prescription_id = lp.prescription_id')
                .whereRaw('skl.region = lp.region')
                .whereRaw('skl.department = lp.department');
            });
            sub.orWhereExists((inner) => {
              inner
                .select(db.raw('1'))
                .from(
                  `${localPrescriptionSubstanceKindsLaboratoriesTable} as skl`
                )
                .whereRaw('skl.prescription_id = lp.prescription_id')
                .whereRaw('skl.region = lp.region')
                .whereRaw('skl.department = lp.department')
                .whereNull('skl.laboratory_id');
            });
          });
        });
    });
  }

  if (findOptions.missingSlaughterhouse) {
    builder.whereRaw(
      `coalesce((
        select lp.sample_count from ${localPrescriptionsTable} lp
        where lp.prescription_id = ${prescriptionsTable}.id
          and lp.company_siret = 'None'
          ${findOptions.region ? 'and lp.region = :region' : ''}
          ${findOptions.department ? 'and lp.department = :department' : ''}
        limit 1
      ), 0) > coalesce((
        select sum(lp.sample_count) from ${localPrescriptionsTable} lp
        where lp.prescription_id = ${prescriptionsTable}.id
          and lp.company_siret <> 'None'
          ${findOptions.region ? 'and lp.region = :region' : ''}
          ${findOptions.department ? 'and lp.department = :department' : ''}
      ), 0)`,
      omitBy(
        {
          region: findOptions.region,
          department: findOptions.department
        },
        isNil
      ) as Record<string, string>
    );
  }
};

const findUnique = async (id: string): Promise<Prescription | undefined> => {
  console.info('Find prescription by id', id);
  return Prescriptions()
    .where({ id })
    .first()
    .then((_) => _ && Prescription.parse(omitBy(_, isNil)));
};

interface ResolvedFilters {
  matrixKinds: MatrixKind[] | undefined;
  subPlanIds: ProgrammingSubPlanId[] | undefined;
}

const resolveFilters = async (
  findOptions: FindPrescriptionOptions
): Promise<ResolvedFilters> => ({
  matrixKinds: matrixKindsFilter(findOptions),
  subPlanIds: await subPlanIdsFilter(findOptions)
});

const buildFindQuery = (
  findOptions: FindPrescriptionOptions,
  { matrixKinds, subPlanIds }: ResolvedFilters,
  visibility?: PendingChangeVisibility
): Knex.QueryBuilder =>
  Prescriptions().modify((builder) => {
    if (findOptions.programmingPlanId) {
      builder.where(
        `${prescriptionsTable}.programming_plan_id`,
        findOptions.programmingPlanId
      );
    }
    if (findOptions.programmingPlanIds) {
      builder.whereIn(
        `${prescriptionsTable}.programming_plan_id`,
        findOptions.programmingPlanIds
      );
    }
    if (findOptions.year || findOptions.programmingPlanDomainIds) {
      builder.join(
        programmingPlansTable,
        `${prescriptionsTable}.programming_plan_id`,
        `${programmingPlansTable}.id`
      );
    }
    if (findOptions.year) {
      builder.where(`${programmingPlansTable}.year`, findOptions.year);
    }
    if (findOptions.programmingPlanDomainIds) {
      builder.whereIn(
        `${programmingPlansTable}.domain_id`,
        findOptions.programmingPlanDomainIds
      );
    }
    if (findOptions.matrixKind) {
      builder.where(
        `${prescriptionsTable}.matrix_kind`,
        findOptions.matrixKind
      );
    }
    if (findOptions.contexts) {
      builder.whereIn(`${prescriptionsTable}.context`, findOptions.contexts);
    }
    if (subPlanIds) {
      builder.whereIn(
        `${prescriptionsTable}.programming_sub_plan_id`,
        subPlanIds
      );
    }
    if (matrixKinds) {
      builder.whereIn(`${prescriptionsTable}.matrix_kind`, matrixKinds);
    }
    applyLocalPrescriptionFilters(builder, findOptions, visibility);
  });

const findMany = async (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): Promise<Prescription[]> => {
  console.info('Find prescriptions', omitBy(findOptions, isNil));

  const resolved = await resolveFilters(findOptions);

  return buildFindQuery(findOptions, resolved, visibility)
    .select(`${prescriptionsTable}.*`)
    .modify(include(findOptions))
    .then((prescriptions: Prescription[]) =>
      prescriptions.map((_: Prescription) =>
        Prescription.parse(omitBy(_, isNil))
      )
    );
};

const findCounts = async (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): Promise<{ subPlanId: ProgrammingSubPlanId; matrixKind: MatrixKind }[]> => {
  console.info('Count prescriptions', omitBy(findOptions, isNil));

  const countOptions = omit(findOptions, 'subPlanStage');
  const resolved = await resolveFilters(countOptions);

  return buildFindQuery(countOptions, resolved, visibility)
    .select(
      `${prescriptionsTable}.programming_sub_plan_id as subPlanId`,
      `${prescriptionsTable}.matrix_kind as matrixKind`
    )
    .then(
      (rows: { subPlanId: ProgrammingSubPlanId; matrixKind: MatrixKind }[]) =>
        rows.map(({ subPlanId, matrixKind }) => ({ subPlanId, matrixKind }))
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
            `count(substance) filter (where analysis_method = 'Mono') as mono_analysis_count`
          ),
          db.raw(
            `count(substance) filter (where analysis_method = 'Multi') as multi_analysis_count`
          )
        )
        .leftJoin(
          prescriptionSubstanceTable,
          'prescription_id',
          `${prescriptionsTable}.id`
        )
        .groupBy(`${prescriptionsTable}.id`);
    }
  };

  return (query: Knex.QueryBuilder) => {
    const includes = opts?.includes
      ? isArray(opts.includes)
        ? opts.includes
        : [opts.includes]
      : [];
    uniq(includes).forEach((include) => {
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
  findCounts,
  insert,
  update,
  deleteOne
};
