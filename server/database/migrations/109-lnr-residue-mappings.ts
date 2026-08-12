import type { Knex } from 'knex';

const LABORATORY_SHORT_NAME = 'ANS 94a - LNR PEST';

export const RESIDUE_MAPPINGS: [label: string, ssd2Id: string][] = [
  ['ALDRINE', 'RF-0021-002-PPP'],
  ['DIELDRINE', 'RF-0021-003-PPP'],
  [
    'ALDRINE & DIELDRINE (Somme de Aldrine et dieldrine, exprimée en dieldrine)',
    'RF-0021-001-PPP'
  ],
  ['CHLORDANE CIS', 'RF-0075-004-PPP'],
  ['CHLORDANE TRANS', 'RF-0075-003-PPP'],
  ['CHLORDANE (Somme de cis- et trans-chlordane)', 'RF-0075-001-PPP'],
  ['CHLORDANE OXY', 'RF-0827-001-PPP'],
  ['CHLOROBENZILATE', 'RF-0082-001-PPP'],
  ["DDD o,p' (TDE o,p')", 'RF-0119-005-PPP'],
  ["DDD p,p' (TDE p,p')", 'RF-0119-004-PPP'],
  ["DDE o,p'", 'RF-0119-007-PPP'],
  ["DDE p,p'", 'RF-0119-002-PPP'],
  ["DDT o,p'", 'RF-0119-003-PPP'],
  ["DDT p,p'", 'RF-0119-006-PPP'],
  [
    "DDT (Somme de p,p'-DDT, o,p'-DDT, p,p'-DDE et p,p'-TDE (DDD), exprimée en DDT)",
    'RF-0119-001-PPP'
  ],
  ['ENDOSULFAN ALPHA', 'RF-0155-004-PPP'],
  ['ENDOSULFAN BETA', 'RF-0155-003-PPP'],
  ['ENDOSULFAN SULFATE', 'RF-0155-002-PPP'],
  [
    'ENDOSULFAN (Somme de alpha- et beta- isomères et endosulfan-sulfate, exprimée en endosulfan)',
    'RF-0155-001-PPP'
  ],
  ['ENDRINE', 'RF-0156-001-PPP'],
  ['HCB', 'RF-0237-001-PPP'],
  ['HCH ALPHA', 'RF-0238-001-PPP'],
  ['HCH BETA', 'RF-0239-002-PPP'],
  ['HCH GAMMA', 'RF-0263-001-PPP'],
  ['HEPTACHLORE', 'RF-0236-004-PPP'],
  ['HEPTACHLORE EPOXIDE CIS', 'RF-0236-008-PPP'],
  ['HEPTACHLORE EPOXIDE TRANS', 'RF-0236-007-PPP'],
  [
    'HEPTACHLORE (Somme de heptachlore et heptachlore-epoxide, exprimée en heptachlore)',
    'RF-0236-001-PPP'
  ],
  ['METOXYCHLORE', 'RF-0295-001-PPP'],
  ['PENDIMETHALINE', 'RF-0331-001-PPP'],
  ['QUINTOZENE', 'RF-0383-002-PPP'],
  ['TECNAZENE', 'RF-0406-001-PPP'],
  ['VINCLOZOLINE', 'RF-0450-003-PPP'],
  ['BIFENTHRINE', 'RF-0046-001-PPP'],
  ['CYFLUTHRINE', 'RF-0108-001-PPP'],
  ['CYHALOTHRINE LAMBDA', 'RF-1004-001-PPP'],
  ['CYPERMETHRINE', 'RF-0112-004-PPP'],
  ['DELTAMETHRINE', 'RF-0120-001-PPP'],
  [
    'FENVALERATE (Somme des isomères (RR, SS, RS et SR) et de esfenvalerate)',
    'RF-0690-006-PPP'
  ],
  ['PERMETHRINE CIS', 'RF-0842-002-PPP'],
  ['PERMETHRINE TRANS', 'RF-0975-001-PPP'],
  ['PERMETHRINE (Somme des isomères)', 'RF-0842-001-PPP']
];

export const up = async (knex: Knex) => {
  const laboratory = await knex('laboratories')
    .where({ short_name: LABORATORY_SHORT_NAME })
    .first('id');

  if (!laboratory) {
    return;
  }

  await knex('laboratory_residue_mappings')
    .insert(
      RESIDUE_MAPPINGS.map(([label, ssd2Id]) => ({
        laboratory_id: laboratory.id,
        label,
        ssd2_id: ssd2Id
      }))
    )
    .onConflict(['laboratory_id', 'label'])
    .merge(['ssd2_id']);
};

export const down = async (knex: Knex) => {
  const laboratory = await knex('laboratories')
    .where({ short_name: LABORATORY_SHORT_NAME })
    .first('id');

  if (!laboratory) {
    return;
  }

  await knex('laboratory_residue_mappings')
    .where({ laboratory_id: laboratory.id })
    .whereIn(
      'label',
      RESIDUE_MAPPINGS.map(([label]) => label)
    )
    .delete();
};
