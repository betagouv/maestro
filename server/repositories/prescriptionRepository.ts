import type { Knex } from 'knex';
import { intersection, isArray, isNil, omit, omitBy, uniq } from 'lodash-es';
import type { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import type {
  FindPrescriptionOptions,
  PrescriptionOptionsInclude
} from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
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
): MatrixKind[] | undefined =>
  findOptions.matrixKinds?.length ? findOptions.matrixKinds : undefined;

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
    builder.whereRaw(
      missingLaboratoryExpression(findOptions, visibility),
      scopeBindings(findOptions, visibility)
    );
  }

  if (findOptions.missingDistribution) {
    builder.whereRaw(...missingDistributionExpression(findOptions, visibility));
  }

  if (findOptions.withNovelty) {
    builder.whereRaw(...noveltyExpression(findOptions, visibility));
  }
};

const scopeBindings = (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): Record<string, string> =>
  omitBy(
    {
      region: findOptions.region,
      department: findOptions.department,
      echelon:
        visibility?.seesUnappliedChanges === false
          ? undefined
          : visibility?.echelon
    },
    isNil
  ) as Record<string, string>;

const effectiveSampleCount = (
  alias: string,
  visibility?: PendingChangeVisibility
): string =>
  visibility?.seesUnappliedChanges === false
    ? `${alias}.sample_count`
    : `coalesce((
        select c.sample_count from ${localPrescriptionChangesTable} c
        where c.prescription_id = ${alias}.prescription_id
          and c.region = ${alias}.region
          and c.department = ${alias}.department
          and c.company_siret = ${alias}.company_siret
          and c.kind = 'sampleCount'
          and c.applied_at is null
          and (c.diffused_at is not null ${visibility?.echelon ? 'or c.echelon = :echelon' : ''})
        order by c.changed_at desc
        limit 1
      ), ${alias}.sample_count)`;

const distributedToSlaughterhouses = (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
) => `
  coalesce((
    select ${effectiveSampleCount('lp', visibility)}
    from ${localPrescriptionsTable} lp
    where lp.prescription_id = ${prescriptionsTable}.id
      and lp.company_siret = 'None'
      ${findOptions.region ? 'and lp.region = :region' : ''}
      ${findOptions.department ? 'and lp.department = :department' : ''}
    limit 1
  ), 0) <> coalesce((
    select sum(${effectiveSampleCount('lp', visibility)})
    from ${localPrescriptionsTable} lp
    where lp.prescription_id = ${prescriptionsTable}.id
      and lp.company_siret <> 'None'
      ${findOptions.region ? 'and lp.region = :region' : ''}
      ${findOptions.department ? 'and lp.department = :department' : ''}
  ), 0)`;

const distributedToDepartments = (visibility?: PendingChangeVisibility) => `
  coalesce((
    select ${effectiveSampleCount('lp', visibility)}
    from ${localPrescriptionsTable} lp
    where lp.prescription_id = ${prescriptionsTable}.id
      and lp.region = :region
      and lp.department = 'None'
      and lp.company_siret = 'None'
    limit 1
  ), 0) <> coalesce((
    select sum(${effectiveSampleCount('lp', visibility)})
    from ${localPrescriptionsTable} lp
    where lp.prescription_id = ${prescriptionsTable}.id
      and lp.region = :region
      and lp.department <> 'None'
      and lp.company_siret = 'None'
  ), 0)`;

const distributedToRegions = (visibility?: PendingChangeVisibility) => `
  coalesce(${prescriptionsTable}.sample_count, 0) <> coalesce((
    select sum(${effectiveSampleCount('lp', visibility)})
    from ${localPrescriptionsTable} lp
    where lp.prescription_id = ${prescriptionsTable}.id
      and lp.department = 'None'
      and lp.company_siret = 'None'
  ), 0)`;

const missingDistributionExpression = (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): [string, Record<string, string>] => {
  const bindings = scopeBindings(findOptions, visibility);

  if (findOptions.department) {
    return [distributedToSlaughterhouses(findOptions, visibility), bindings];
  }

  if (findOptions.region) {
    return [
      `case when (
         select pp.distribution_kind from ${programmingPlansTable} pp
         where pp.id = ${prescriptionsTable}.programming_plan_id
       ) = 'SLAUGHTERHOUSE'
       then ${distributedToDepartments(visibility)}
       else false
       end`,
      bindings
    ];
  }

  return [distributedToRegions(visibility), bindings];
};

const noveltyExpression = (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): [string, string[]] => [
  `exists (
     select 1 from ${localPrescriptionChangesTable} c
     where c.prescription_id = ${prescriptionsTable}.id
       and c.kind = 'sampleCount'
       and c.changes_viewed_at is null
       and c.diffused_at is not null
       and c.company_siret = 'None'
       ${visibility?.echelon ? 'and c.echelon <> ?' : ''}
       ${visibility?.seesUnappliedChanges === false ? 'and c.applied_at is not null' : ''}
       ${findOptions.region ? 'and c.region = ?' : ''}
       and c.department ${findOptions.department ? '= ?' : "= 'None'"}
   )`,
  [
    ...(visibility?.echelon ? [visibility.echelon] : []),
    ...(findOptions.region ? [findOptions.region] : []),
    ...(findOptions.department ? [findOptions.department] : [])
  ]
];

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

interface PrescriptionCountRow {
  planId: string;
  subPlanId: ProgrammingSubPlanId;
  matrixKind: MatrixKind;
  context: ProgrammingPlanContext;
  sampleCount: number;
  missingDistribution: boolean;
  missingLaboratory: boolean;
  hasNovelty: boolean;
}

const scopedSampleCount = (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): string =>
  findOptions.region
    ? `coalesce((
        select ${effectiveSampleCount('lp', visibility)}
        from ${localPrescriptionsTable} lp
        where lp.prescription_id = ${prescriptionsTable}.id
          and lp.region = :region
          and lp.department ${findOptions.department ? '= :department' : "= 'None'"}
          and lp.company_siret = 'None'
        limit 1
      ), 0)`
    : `coalesce(${prescriptionsTable}.sample_count, 0)`;

const effectiveLaboratories = (visibility?: PendingChangeVisibility): string =>
  visibility?.seesUnappliedChanges === false
    ? 'null::jsonb'
    : `(
        select c.substance_kinds_laboratories
        from ${localPrescriptionChangesTable} c
        where c.prescription_id = lp.prescription_id
          and c.region = lp.region
          and c.department = lp.department
          and c.company_siret = lp.company_siret
          and c.kind = 'laboratories'
          and c.applied_at is null
          and (c.diffused_at is not null ${visibility?.echelon ? 'or c.echelon = :echelon' : ''})
        order by c.changed_at desc
        limit 1
      )`;

const missingLaboratoryExpression = (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): string => `exists (
     select 1 from ${localPrescriptionsTable} lp
     where lp.prescription_id = ${prescriptionsTable}.id
       and lp.company_siret = 'None'
       ${findOptions.region ? 'and lp.region = :region' : ''}
       and lp.department ${findOptions.department ? '= :department' : "= 'None'"}
       and not (
         case when ${effectiveLaboratories(visibility)} is not null
           then jsonb_array_length(${effectiveLaboratories(visibility)}) > 0
             and not exists (
               select 1
               from jsonb_array_elements(${effectiveLaboratories(visibility)}) slot
               where slot->>'laboratoryId' is null
             )
           else exists (
               select 1 from ${localPrescriptionSubstanceKindsLaboratoriesTable} skl
               where skl.prescription_id = lp.prescription_id
                 and skl.region = lp.region
                 and skl.department = lp.department
             )
             and not exists (
               select 1 from ${localPrescriptionSubstanceKindsLaboratoriesTable} skl
               where skl.prescription_id = lp.prescription_id
                 and skl.region = lp.region
                 and skl.department = lp.department
                 and skl.laboratory_id is null
             )
         end
       )
   )`;

const findCounts = async (
  findOptions: FindPrescriptionOptions,
  visibility?: PendingChangeVisibility
): Promise<PrescriptionCountRow[]> => {
  console.info('Count prescriptions', omitBy(findOptions, isNil));

  const countOptions = omit(
    findOptions,
    'subPlanStage',
    'missingDistribution',
    'missingLaboratory',
    'withNovelty'
  );
  const resolved = await resolveFilters(countOptions);
  const bindings = scopeBindings(countOptions, visibility);

  const [distributionSql] = missingDistributionExpression(
    countOptions,
    visibility
  );
  const [noveltySql, noveltyBindings] = noveltyExpression(
    countOptions,
    visibility
  );

  return buildFindQuery(countOptions, resolved, visibility)
    .select(
      `${prescriptionsTable}.programming_plan_id as planId`,
      `${prescriptionsTable}.programming_sub_plan_id as subPlanId`,
      `${prescriptionsTable}.matrix_kind as matrixKind`,
      `${prescriptionsTable}.context as context`,
      db.raw(
        `${scopedSampleCount(countOptions, visibility)} as "sampleCount"`,
        bindings
      ),
      db.raw(`(${distributionSql}) as "missingDistribution"`, bindings),
      db.raw(
        `${missingLaboratoryExpression(countOptions, visibility)} as "missingLaboratory"`,
        bindings
      ),
      db.raw(`${noveltySql} as "hasNovelty"`, noveltyBindings)
    )
    .then((rows: PrescriptionCountRow[]) =>
      rows.map((row) => ({
        planId: row.planId,
        subPlanId: row.subPlanId,
        matrixKind: row.matrixKind,
        context: row.context,
        sampleCount: Number(row.sampleCount),
        missingDistribution: row.missingDistribution,
        missingLaboratory: row.missingLaboratory,
        hasNovelty: row.hasNovelty
      }))
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
