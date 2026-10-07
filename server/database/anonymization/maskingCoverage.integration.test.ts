import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'kysely';
import { describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { maskingExceptions } from './maskingExceptions';

const maskingRulesPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'masking_rules.sql'
);

const maskedColumns = (): Set<string> => {
  const statements = readFileSync(maskingRulesPath, 'utf8')
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n');

  return new Set(
    [...statements.matchAll(/ON COLUMN (\w+)\.(\w+)/g)].map(
      ([, table, column]) => `${table}.${column}`
    )
  );
};

const exceptedColumns = (): Set<string> =>
  new Set(
    Object.entries(maskingExceptions).flatMap(([table, columns]) =>
      columns.map((column) => `${table}.${column}`)
    )
  );

const sensitiveDataTypes = [
  'text',
  'character varying',
  'character',
  'json',
  'jsonb',
  'point',
  'ARRAY',
  'USER-DEFINED'
];

const findSensitiveColumns = async () => {
  const { rows } = await sql<{ tableName: string; columnName: string }>`
    SELECT c.table_name AS "tableName", c.column_name AS "columnName"
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.data_type = ANY(${sensitiveDataTypes})
    ORDER BY c.table_name, c.column_name
  `.execute(kysely);

  return rows;
};

describe('couverture du masquage Metabase', () => {
  test('toute colonne sensible est masquée ou explicitement exceptée', async () => {
    const masked = maskedColumns();
    const excepted = exceptedColumns();

    const uncovered = (await findSensitiveColumns())
      .map(({ tableName, columnName }) => `${tableName}.${columnName}`)
      .filter((column) => !masked.has(column) && !excepted.has(column));

    expect(
      uncovered,
      [
        'Ces colonnes ne sont ni masquées ni exceptées, donc lisibles en clair par Metabase.',
        'Ajouter une règle dans masking_rules.sql, ou une entrée dans maskingExceptions.ts',
        'si la colonne ne contient rien de personnel :',
        ...uncovered.map((column) => `  - ${column}`)
      ].join('\n')
    ).toEqual([]);
  });

  test('les règles de masquage ne visent que des colonnes existantes', async () => {
    const existing = new Set(
      (await findSensitiveColumns()).map(
        ({ tableName, columnName }) => `${tableName}.${columnName}`
      )
    );

    const unknown = [...maskedColumns()].filter(
      (column) => !existing.has(column)
    );

    expect(
      unknown,
      [
        'Ces règles visent des colonnes absentes du schéma : la transaction',
        'masking_rules.sql échouera en production.',
        ...unknown.map((column) => `  - ${column}`)
      ].join('\n')
    ).toEqual([]);
  });
});
