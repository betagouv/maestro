import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { groupBy } from 'lodash-es';
import { initKysely, kysely } from '../../repositories/kysely';
import config from '../../utils/config';
import { computeContextSigleImport } from './contextSigleImport';
import {
  computeDescriptorImport,
  ImportedActes,
  type MaestroState
} from './descriptorImport';
import { renderDescriptorMigration } from './descriptorMigration';
import { renderDescriptorReport } from './descriptorReport';
import { readSigalWorkbook } from './sigalWorkbook';

const year = 2026;

const migrationsDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../database/migrations'
);

const readMaestroState = async (): Promise<MaestroState> => {
  const subPlans = await kysely
    .selectFrom('programmingSubPlansRaw as sp')
    .innerJoin('programmingPlans as p', 'p.id', 'sp.programmingPlanId')
    .select([
      'sp.subPlanNumber',
      'sp.programmingPlanId',
      'sp.sachaContextSigle',
      'p.title'
    ])
    .where('p.year', '=', year)
    .execute();

  const fields = await kysely
    .selectFrom('specificDataFields')
    .select(['key', 'sachaInDai'])
    .execute();
  const optionsByFieldKey = groupBy(
    await kysely
      .selectFrom('specificDataFieldOptions')
      .select([
        'fieldKey',
        'value',
        'label',
        'order',
        'sachaCommemoratifValueSigle'
      ])
      .execute(),
    'fieldKey'
  );

  const planFields = await kysely
    .selectFrom('programmingPlanFields as pf')
    .innerJoin('specificDataFields as f', 'f.id', 'pf.fieldId')
    .select(['pf.programmingPlanId', 'f.key'])
    .execute();

  const subPlanFields = await kysely
    .selectFrom('programmingSubPlanFieldsRaw as spf')
    .innerJoin(
      'programmingSubPlansRaw as sp',
      'sp.id',
      'spf.programmingSubPlanId'
    )
    .innerJoin('programmingPlans as p', 'p.id', 'sp.programmingPlanId')
    .innerJoin('specificDataFields as f', 'f.id', 'spf.fieldId')
    .select([
      'spf.id',
      'sp.subPlanNumber',
      'f.key',
      'spf.inheritance',
      'spf.required'
    ])
    .where('p.year', '=', year)
    .execute();
  const optionValuesBySubPlanFieldId = groupBy(
    await kysely
      .selectFrom('programmingSubPlanFieldOptions as spfo')
      .innerJoin(
        'specificDataFieldOptions as o',
        'o.id',
        'spfo.specificDataFieldOptionId'
      )
      .select(['spfo.programmingSubPlanFieldId', 'o.value'])
      .execute(),
    'programmingSubPlanFieldId'
  );

  return {
    subPlans: subPlans.map(
      ({ subPlanNumber, programmingPlanId, sachaContextSigle, title }) => ({
        subPlanNumber,
        programmingPlanId,
        programmingPlanTitle: title,
        sachaContextSigle
      })
    ),
    fields: fields.map(({ key, sachaInDai }) => ({
      key,
      sachaInDai,
      options: (optionsByFieldKey[key] ?? []).map((option) => ({
        value: option.value,
        label: option.label,
        order: option.order,
        sachaCommemoratifValueSigle: option.sachaCommemoratifValueSigle
      }))
    })),
    planFields: planFields.map(({ programmingPlanId, key }) => ({
      programmingPlanId,
      fieldKey: key
    })),
    subPlanFields: subPlanFields.map(
      ({ id, subPlanNumber, key, inheritance, required }) => ({
        subPlanNumber,
        fieldKey: key,
        inheritance,
        required,
        optionValues: (optionValuesBySubPlanFieldId[id] ?? []).map(
          ({ value }) => value
        )
      })
    )
  };
};

const nextMigrationNumber = () =>
  Math.max(
    ...readdirSync(migrationsDirectory).map(
      (file) => Number.parseInt(file, 10) || 0
    )
  ) + 1;

const importSigalDescriptors = async (workbookFile: string) => {
  initKysely(config.databaseUrl);

  const workbook = readSigalWorkbook(workbookFile);
  const maestroState = await readMaestroState();
  const descriptorImport = computeDescriptorImport(
    {
      ...workbook,
      acteDescriptors: workbook.acteDescriptors.filter(({ acte }) =>
        ImportedActes.includes(acte)
      )
    },
    maestroState
  );
  const contextSigleImport = computeContextSigleImport(
    workbook.subPlans,
    maestroState.subPlans
  );

  const reportFile = path.join(
    path.dirname(workbookFile),
    'rapport_descripteurs.md'
  );
  writeFileSync(
    reportFile,
    renderDescriptorReport(
      descriptorImport,
      contextSigleImport,
      path.basename(workbookFile)
    )
  );
  console.info(`Rapport : ${reportFile}`);

  const {
    fields,
    options,
    planFields,
    subPlanFields,
    subPlanFieldReplacements
  } = descriptorImport;
  if (
    fields.length +
      options.length +
      planFields.length +
      subPlanFields.length +
      subPlanFieldReplacements.length +
      contextSigleImport.updates.length ===
    0
  ) {
    console.info('Rien à faire : la base contient déjà tous les descripteurs.');
    return;
  }

  const migrationFile = path.join(
    migrationsDirectory,
    `${nextMigrationNumber()}-sigal-sampler-descriptors.ts`
  );
  writeFileSync(
    migrationFile,
    renderDescriptorMigration(descriptorImport, contextSigleImport, year)
  );
  console.info(`Migration : ${migrationFile}`);
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  const workbookFile = process.argv[2];
  if (!workbookFile) {
    console.error('Usage : npm run sigal-import -w server -- <fichier Excel>');
    process.exit(1);
  }
  importSigalDescriptors(path.resolve(workbookFile))
    .then(() => process.exit())
    .catch((e) => {
      console.error('Erreur', e);
      process.exit(1);
    });
}
