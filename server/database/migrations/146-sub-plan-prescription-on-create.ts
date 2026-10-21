import type { Knex } from 'knex';

const departmentsByRegion: Record<string, string[]> = {
  '11': ['75', '77', '78', '91', '92', '93', '94', '95'],
  '24': ['18', '28', '36', '37', '41', '45'],
  '27': ['21', '25', '39', '58', '70', '71', '89', '90'],
  '28': ['14', '27', '50', '61', '76'],
  '32': ['02', '59', '60', '62', '80'],
  '44': ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
  '52': ['44', '49', '53', '72', '85'],
  '53': ['22', '29', '35', '56'],
  '75': [
    '16',
    '17',
    '19',
    '23',
    '24',
    '33',
    '40',
    '47',
    '64',
    '79',
    '86',
    '87'
  ],
  '76': [
    '09',
    '11',
    '12',
    '30',
    '31',
    '32',
    '34',
    '46',
    '48',
    '65',
    '66',
    '81',
    '82'
  ],
  '84': [
    '01',
    '03',
    '07',
    '15',
    '26',
    '38',
    '42',
    '43',
    '63',
    '69',
    '73',
    '74'
  ],
  '93': ['04', '05', '06', '13', '83', '84'],
  '94': ['2A', '2B'],
  '01': ['971'],
  '02': ['972'],
  '03': ['973'],
  '04': ['974'],
  '06': ['976']
};

const setSubPlanForeignKey = async (knex: Knex, onDelete: 'CASCADE' | null) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropForeign(['programming_sub_plan_id']);
  });
  await knex.schema.alterTable('prescriptions', (table) => {
    const foreign = table
      .foreign('programming_sub_plan_id')
      .references('id')
      .inTable('programming_sub_plans_raw');
    if (onDelete) {
      foreign.onDelete(onDelete);
    }
  });
};

export const up = async (knex: Knex) => {
  await setSubPlanForeignKey(knex, 'CASCADE');

  const regionValues = Object.keys(departmentsByRegion)
    .map((region) => `('${region}')`)
    .join(', ');
  const departmentValues = Object.entries(departmentsByRegion)
    .flatMap(([region, departments]) =>
      departments.map((department) => `('${region}', '${department}')`)
    )
    .join(', ');

  await knex.raw(`
    WITH inserted AS (
      INSERT INTO prescriptions (programming_sub_plan_id, sample_count)
      SELECT sp.id, 0
      FROM programming_sub_plans_raw sp
      WHERE NOT EXISTS (
        SELECT 1 FROM prescriptions p WHERE p.programming_sub_plan_id = sp.id
      )
      RETURNING id, programming_sub_plan_id
    ),
    regions (region) AS (VALUES ${regionValues}),
    departments (region, department) AS (VALUES ${departmentValues})
    INSERT INTO local_prescriptions (prescription_id, region, department, company_siret, sample_count)
    SELECT inserted.id, regions.region, 'None', 'None', 0
    FROM inserted CROSS JOIN regions
    UNION ALL
    SELECT inserted.id, departments.region, departments.department, 'None', 0
    FROM inserted
    JOIN programming_sub_plans_raw sp ON sp.id = inserted.programming_sub_plan_id
    CROSS JOIN departments
    WHERE sp.sub_plan_number NOT LIKE 'PPV%'
  `);
};

export const down = async (knex: Knex) => {
  await setSubPlanForeignKey(knex, null);
};
