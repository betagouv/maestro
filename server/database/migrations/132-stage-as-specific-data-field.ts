import type { Knex } from 'knex';

const FIELD_KEY = 'stage';

const SUB_STAGE_LABELS: Record<string, string> = {
  STADE1: 'Végétal au stade récolte',
  STADE2: 'Végétal en cours de culture (avant récolte)',
  STADE3: 'Végétal au stockage',
  STADE4: 'Aliment pour animaux',
  STADE5: 'Eau',
  STADE6: 'Intrant (spécialité commerciale ou bouillie)',
  STADE7: 'Produit végétal transformé',
  STADE8: 'Substrat',
  STADE9: 'Autre',
  STADE10: 'Abattoir',
  STADE11: 'Elevage pondeuse',
  STADE12: "Centre d'emballage",
  STADE13: 'Amont (fournisseur)',
  STADE14: 'Amont (usine)',
  STADE15: 'Commerce de détail',
  STADE16: 'Commerce de gros',
  STADE17: 'Conditionnement',
  STADE18: 'Distribution',
  STADE19: 'Distribution (détail)',
  STADE20: 'Distribution (détail, gros)',
  STADE21: 'Distribution (étal marché, etc.)',
  STADE22: 'Distribution (gros)',
  STADE23: 'Distribution (gros ou détail)',
  STADE24: 'Entrepôt',
  STADE25: 'Élevage',
  STADE26: 'Établissement de collecte',
  STADE27: 'Exploitation agricole (circuits formels et informels)',
  STADE28: 'Fabrication',
  STADE29: 'Fabrication (restauration)',
  STADE30: 'Ferme',
  STADE31: 'Gros',
  STADE32: 'Grossistes',
  STADE33: 'Import',
  STADE34: 'Importateur',
  STADE35: 'Importation',
  STADE36: 'Maraîcher',
  STADE37: 'Mise sur le marché',
  STADE38: 'Navires de pêche primaire, au débarquement',
  STADE39: 'Ns',
  STADE40: 'Prod. primaire',
  STADE41: 'Production',
  STADE42: 'Production primaire',
  STADE43: 'Torréfaction',
  STADE44: 'Transformation',
  STADE45: 'Tuerie',
  STADE46: 'Usine conserverie',
  STADE47: 'Usine de transformation',
  STADE48: 'Utilisation'
};

export const up = async (knex: Knex) => {
  const [field] = await knex('specific_data_fields')
    .insert({
      key: FIELD_KEY,
      inputType: 'select',
      label: 'Stade de prélèvement',
      hintText: null
    })
    .returning('id');

  const fieldId = field.id;

  await knex('specific_data_field_options').insert(
    Object.entries(SUB_STAGE_LABELS).map(([value, label], index) => ({
      fieldKey: FIELD_KEY,
      value,
      label,
      order: index + 1
    }))
  );

  await knex.raw(
    `insert into programming_sub_plan_fields_raw
       (programming_sub_plan_id, field_id, required, "order", inheritance)
     select sp.id, ?, true,
            coalesce(
              (select min(f."order") - 1
               from programming_sub_plan_fields_raw f
               where f.programming_sub_plan_id = sp.id),
              0
            ),
            'Own'
     from programming_sub_plans_raw sp`,
    [fieldId]
  );

  await knex.raw(
    `insert into programming_sub_plan_field_options
       (programming_sub_plan_field_id, specific_data_field_option_id)
     select distinct spf.id, sdfo.id
     from programming_sub_plan_fields_raw spf
     join specific_data_field_options sdfo on sdfo.field_key = ?
     where spf.field_id = ?
       and (
         exists (
           select 1 from prescriptions p
           where p.programming_sub_plan_id = spf.programming_sub_plan_id
             and sdfo.value = any(p.stages)
         )
         or exists (
           select 1 from samples s
           where s.programming_sub_plan_id = spf.programming_sub_plan_id
             and s.stage = sdfo.value
         )
       )`,
    [FIELD_KEY, fieldId]
  );

  await knex.raw(
    `insert into programming_plan_fields
       (programming_plan_id, field_id, required, "order")
     select pp.id, ?, true,
            coalesce(
              (select min(f."order") - 1
               from programming_plan_fields f
               where f.programming_plan_id = pp.id),
              0
            )
     from programming_plans pp`,
    [fieldId]
  );

  await knex.raw(
    `insert into programming_plan_field_options
       (programming_plan_field_id, specific_data_field_option_id)
     select distinct pf.id, spfo.specific_data_field_option_id
     from programming_plan_fields pf
     join programming_sub_plans_raw sp on sp.programming_plan_id = pf.programming_plan_id
     join programming_sub_plan_fields_raw spf
       on spf.programming_sub_plan_id = sp.id and spf.field_id = pf.field_id
     join programming_sub_plan_field_options spfo
       on spfo.programming_sub_plan_field_id = spf.id
     where pf.field_id = ?`,
    [fieldId]
  );

  // Un plan dont aucun sous-plan ne porte de stade laisserait le formulaire
  // hors plan sans aucun choix : on lui ouvre le référentiel complet.
  await knex.raw(
    `insert into programming_plan_field_options
       (programming_plan_field_id, specific_data_field_option_id)
     select pf.id, sdfo.id
     from programming_plan_fields pf
     join specific_data_field_options sdfo on sdfo.field_key = ?
     where pf.field_id = ?
       and not exists (
         select 1 from programming_plan_field_options o
         where o.programming_plan_field_id = pf.id
       )`,
    [FIELD_KEY, fieldId]
  );

  await knex.raw(
    `insert into sample_specific_data_values (sample_id, field_id, value, option_id)
     select s.id, ?, null, sdfo.id
     from samples s
     join specific_data_field_options sdfo
       on sdfo.field_key = ? and sdfo.value = s.stage
     where s.stage is not null`,
    [fieldId, FIELD_KEY]
  );

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('stage');
  });

  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('stages');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.specificType('stages', 'text[]').notNullable().defaultTo('{}');
  });

  await knex.schema.alterTable('samples', (table) => {
    table.text('stage').nullable();
  });

  const field = await knex('specific_data_fields')
    .select('id')
    .where('key', FIELD_KEY)
    .first();

  if (!field) {
    return;
  }

  await knex.raw(
    `update samples s
     set stage = sdfo.value
     from sample_specific_data_values sdv
     join specific_data_field_options sdfo on sdfo.id = sdv.option_id
     where sdv.sample_id = s.id and sdv.field_id = ?`,
    [field.id]
  );

  await knex.raw(
    `update prescriptions p
     set stages = coalesce(sub.stage_values, '{}')
     from (
       select spf.programming_sub_plan_id,
              array_agg(distinct sdfo.value) as stage_values
       from programming_sub_plan_fields_raw spf
       join programming_sub_plan_field_options spfo
         on spfo.programming_sub_plan_field_id = spf.id
       join specific_data_field_options sdfo
         on sdfo.id = spfo.specific_data_field_option_id
       where spf.field_id = ?
       group by spf.programming_sub_plan_id
     ) sub
     where sub.programming_sub_plan_id = p.programming_sub_plan_id`,
    [field.id]
  );

  await knex('sample_specific_data_values').where('fieldId', field.id).delete();
  await knex('specific_data_field_options')
    .where('fieldKey', FIELD_KEY)
    .delete();
  await knex('specific_data_fields').where('id', field.id).delete();
};
