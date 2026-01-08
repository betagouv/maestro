import { Knex } from 'knex';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { laboratoriesConf } from '../../services/imapService';

type MappingRow = {
  laboratory_id: string;
  label: string;
  ssd2_id: string | null;
};

export const up = async (knex: Knex) => {
  await knex.schema.createTable('laboratory_residue_mappings', (table) => {
    table
      .uuid('laboratory_id')
      .notNullable()
      .references('id')
      .inTable('laboratories')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('label').notNullable();
    table.string('ssd2_id');

    table.unique(['laboratory_id', 'label']);

    table.index(['laboratory_id']);
  });

  const mappings: MappingRow[] = [];

  const laboratories = (await knex
    .select('laboratories.*')
    .from('laboratories')) as Laboratory[];

  Object.entries(laboratoriesConf).forEach(([shortName, conf]) => {
    const laboratory = laboratories.find((l) => l.shortName === shortName);

    if (laboratory) {
      Object.entries(conf.ssd2IdByLabel).forEach(([label, ssd2Id]) => {
        mappings.push({
          laboratory_id: laboratory.id,
          label,
          ssd2_id: ssd2Id
        });
      });

      conf.unknownReferences.forEach((label) => {
        mappings.push({
          laboratory_id: laboratory.id,
          label,
          ssd2_id: null
        });
      });
    }
  });

  if (mappings.length) {
    await knex('laboratory_residue_mappings').insert(mappings);
  }
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratory_residue_mappings');
};
