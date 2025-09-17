import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.renameColumn('name', 'short_name');
  });
  await knex.schema.alterTable('laboratories', (table) => {
    table.string('name');
    table.string('address');
    table.string('postal_code');
    table.string('city');
  });

  await knex.raw(
    `UPDATE laboratories SET name = 'Capinov', address = 'ZI de Lanrinou', postal_code = '29800', city = 'Landerneau' WHERE short_name = 'CAP 29'`
  );
  await knex.raw(
    `UPDATE laboratories SET name = 'CERECO', address = '3, rue Pierre Bautias ZA Aéropôle', postal_code = '30128', city = 'Garons' WHERE short_name = 'CER 30'`
  );
  await knex.raw(
    `UPDATE laboratories SET name = 'GIRPA', address ='9, avenue du Bois l''Abbé', postal_code = '49070', city = 'Beaucouzé' WHERE short_name = 'GIR 49'`
  );
  await knex.raw(
    `UPDATE laboratories SET name = 'Inovalys', address = '128, rue de Beaugé', postal_code = '72018', city = 'LE MANS Cedex 2' WHERE short_name = 'LDA 72'`
  );
  await knex.raw(
    `UPDATE laboratories SET name = 'CAMP', address = '5002F, Rambla de la Thermodynamique', postal_code = '66100', city = 'Perpignan' WHERE short_name = 'LDA 66'`
  );
  await knex.raw(
    `UPDATE laboratories SET name = 'SCL Montpellier', address = '205, Rue de la Croix Verte', postal_code = '34090', city = 'Montpellier' WHERE short_name = 'SCL 34'`
  );
  await knex.raw(
    `UPDATE laboratories SET name = 'SCL d''Ile de France', address = '25, avenue de la République', postal_code = '91300', city = 'MASSY' WHERE short_name = 'SCL 91'`
  );

  await knex.schema.alterTable('laboratories', (table) => {
    table.string('name').notNullable().alter();
    table.string('address').notNullable().alter();
    table.string('postal_code').notNullable().alter();
    table.string('city').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('name');
    table.dropColumn('address');
    table.dropColumn('postal_code');
    table.dropColumn('city');
    table.renameColumn('short_name', 'name');
  });
};
