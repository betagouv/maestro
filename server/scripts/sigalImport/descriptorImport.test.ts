import { describe, expect, test } from 'vitest';
import {
  computeDescriptorImport,
  type DescriptorImport,
  type MaestroState
} from './descriptorImport';
import type { ActeDescriptorRow, SigalWorkbook } from './sigalWorkbook';

const link = (
  acte: string,
  sigle: string,
  inputType = 'Liste à choix unique',
  required = true,
  received = false
): ActeDescriptorRow => ({ acte, sigle, inputType, required, received });

const workbook: SigalWorkbook = {
  acteDescriptors: [
    link('BOV', 'CIBL_BOV'),
    link('BOV', 'SEX1'),
    link('BOV', 'TYPPROD'),
    link('BOV', 'DLCP', 'Date'),
    link('BOV', 'TAILOT', 'Numérique', false),
    link('BOV', 'STNCFPSPC', 'Liste à choix unique', false),
    link('BOV', 'DATRECPREL', 'Date', false, true),
    link('POR', 'CIBL_POR'),
    link('POR', 'SEX1'),
    link('POR', 'DLCP', 'Date', false),
    link('POR', 'TECHNTPREL', 'Liste à choix multiple'),
    link('PECHE', 'CIBL_POR')
  ],
  descriptors: [
    { sigle: 'CIBL_BOV', label: 'Critères de ciblage', standardized: false },
    { sigle: 'CIBL_POR', label: 'Critères de ciblage', standardized: false },
    { sigle: 'SEX1', label: 'Sexe', standardized: true },
    { sigle: 'TYPPROD', label: 'Type de production', standardized: false },
    { sigle: 'DLCP', label: 'Date limite de consommation', standardized: true },
    { sigle: 'TAILOT', label: 'Taille du lot (kg)', standardized: false },
    {
      sigle: 'STNCFPSPC',
      label: 'Suite non conformité PSPC',
      standardized: false
    },
    {
      sigle: 'TECHNTPREL',
      label: 'Taille echantillon prélevé',
      standardized: false
    }
  ],
  descriptorValues: [
    {
      sigle: 'CIBL_BOV',
      value: 'MAIGRE',
      label: 'Animal maigre',
      status: 'Active'
    },
    {
      sigle: 'CIBL_POR',
      value: 'MAIGRE',
      label: 'Animal maigre',
      status: 'Active'
    },
    {
      sigle: 'CIBL_POR',
      value: 'BOITERIE',
      label: 'Boiterie',
      status: 'Active'
    },
    { sigle: 'SEX1', value: 'FEMEL', label: 'Femelle', status: 'Validée' },
    { sigle: 'SEX1', value: 'TT_FM', label: 'Tout femelle', status: 'Gelée' },
    {
      sigle: 'SEX1',
      value: 'HERMA',
      label: 'Hermaphrodite',
      status: 'Validée'
    },
    { sigle: 'TYPPROD', value: 'LAIT', label: 'Laitier', status: 'Active' },
    {
      sigle: 'TYPPROD',
      value: 'MIX',
      label: 'Mixte',
      status: 'Archivée le 26/12/2018'
    }
  ],
  subPlans: [
    { acte: 'BOV', code: '070' },
    { acte: 'POR', code: '071' },
    { acte: 'POR', code: '072' },
    { acte: 'PECHE', code: '937 PS' },
    { acte: 'PECHE', code: '999' }
  ]
};

const emptyMaestro: MaestroState = {
  subPlans: [
    {
      subPlanNumber: '070',
      programmingPlanId: 'p1',
      programmingPlanTitle: 'Plan 1',
      sachaContextSigle: null
    },
    {
      subPlanNumber: '071',
      programmingPlanId: 'p1',
      programmingPlanTitle: 'Plan 1',
      sachaContextSigle: null
    },
    {
      subPlanNumber: '072',
      programmingPlanId: 'p1',
      programmingPlanTitle: 'Plan 1',
      sachaContextSigle: null
    },
    {
      subPlanNumber: '937',
      programmingPlanId: 'p2',
      programmingPlanTitle: 'Plan 2',
      sachaContextSigle: null
    },
    {
      subPlanNumber: 'PPV01',
      programmingPlanId: 'p2',
      programmingPlanTitle: 'Plan 2',
      sachaContextSigle: null
    }
  ],
  fields: [
    {
      key: 'sex',
      sachaInDai: true,
      options: [
        {
          value: 'SEX4',
          label: 'Femelle',
          order: 1,
          sachaCommemoratifValueSigle: 'FEMEL'
        }
      ]
    },
    {
      key: 'productionKind',
      sachaInDai: false,
      options: [
        {
          value: 'PROD_2',
          label: 'Laitier',
          order: 1,
          sachaCommemoratifValueSigle: 'L'
        }
      ]
    },
    { key: 'ageInMonths', sachaInDai: true, options: [] }
  ],
  planFields: [],
  subPlanFields: []
};

const result = computeDescriptorImport(workbook, emptyMaestro);

const fieldOf = (descriptorImport: DescriptorImport, key: string) =>
  descriptorImport.fields.find((field) => field.key === key);

describe('computeDescriptorImport', () => {
  test('ignores received and excluded descriptors', () => {
    expect(fieldOf(result, 'DATRECPREL')).toBeUndefined();
    expect(fieldOf(result, 'STNCFPSPC')).toBeUndefined();
    expect(result.report.excluded).toEqual([
      {
        sigle: 'STNCFPSPC',
        label: 'Suite non conformité PSPC',
        reason: 'Suivi après analyse',
        acteCount: 1
      }
    ]);
  });

  test('merges homonyms outside EDI under the most used sigle', () => {
    expect(fieldOf(result, 'CIBL_POR')).toEqual({
      key: 'CIBL_POR',
      inputType: 'select',
      label: 'Critères de ciblage',
      sachaCommemoratifSigle: null,
      sachaInDai: false
    });
    expect(fieldOf(result, 'CIBL_BOV')).toBeUndefined();
    expect(
      result.options.filter(({ fieldKey }) => fieldKey === 'CIBL_POR')
    ).toEqual([
      {
        fieldKey: 'CIBL_POR',
        value: 'MAIGRE',
        label: 'Animal maigre',
        order: 1,
        sachaCommemoratifValueSigle: null
      },
      {
        fieldKey: 'CIBL_POR',
        value: 'BOITERIE',
        label: 'Boiterie',
        order: 2,
        sachaCommemoratifValueSigle: null
      }
    ]);
  });

  test('splits homonyms whose same value has another label, ignoring case', () => {
    const homonyms = computeDescriptorImport(
      {
        acteDescriptors: [
          link('A', 'CIBL_A'),
          link('B', 'CIBL_B'),
          link('C', 'CIBL_C')
        ],
        descriptors: ['CIBL_A', 'CIBL_B', 'CIBL_C'].map((sigle) => ({
          sigle,
          label: 'Critères de ciblage',
          standardized: false
        })),
        descriptorValues: [
          {
            sigle: 'CIBL_A',
            value: 'ZON',
            label: 'Animal en zone polluée',
            status: 'Active'
          },
          {
            sigle: 'CIBL_B',
            value: 'ZON',
            label: 'Zone de pêche polluée',
            status: 'Active'
          },
          {
            sigle: 'CIBL_C',
            value: 'ZON',
            label: 'animal en zone  polluée',
            status: 'Active'
          }
        ],
        subPlans: []
      },
      emptyMaestro
    );

    expect(homonyms.fields.map(({ key }) => key)).toEqual(['CIBL_A', 'CIBL_B']);
    expect(homonyms.report.merged).toEqual([
      {
        fieldKey: 'CIBL_A',
        label: 'Critères de ciblage',
        inputType: 'select',
        sigles: ['CIBL_A', 'CIBL_C']
      }
    ]);
  });

  test('keeps a standardized descriptor as its own field, in the DAI', () => {
    expect(fieldOf(result, 'DLCP')).toEqual({
      key: 'DLCP',
      inputType: 'date',
      label: 'Date limite de consommation',
      sachaCommemoratifSigle: 'DLCP',
      sachaInDai: true
    });
  });

  test('maps SIGAL types, and a list without value to a text', () => {
    expect(fieldOf(result, 'TAILOT')?.inputType).toBe('decimal');
    expect(fieldOf(result, 'TECHNTPREL')?.inputType).toBe('text');
    expect(result.report.textFallbacks).toEqual([
      { sigle: 'TECHNTPREL', label: 'Taille echantillon prélevé', acteCount: 1 }
    ]);
  });

  test('reuses existing fields and adds the missing valid values', () => {
    expect(fieldOf(result, 'SEX1')).toBeUndefined();
    expect(result.options.filter(({ fieldKey }) => fieldKey === 'sex')).toEqual(
      [
        {
          fieldKey: 'sex',
          value: 'HERMA',
          label: 'Hermaphrodite',
          order: 2,
          sachaCommemoratifValueSigle: 'HERMA'
        }
      ]
    );
    expect(
      result.options.filter(({ fieldKey }) => fieldKey === 'productionKind')
    ).toEqual([]);
    expect(result.report.ignoredValues.map(({ value }) => value)).toEqual([
      'TT_FM',
      'MIX'
    ]);
  });

  test('places on the plan the fields common to its actes with the same setting', () => {
    expect(result.planFields).toEqual([
      {
        programmingPlanTitle: 'Plan 1',
        subPlanNumber: '070',
        fields: [
          {
            fieldKey: 'sex',
            required: true,
            order: 1,
            optionValues: ['SEX4', 'HERMA']
          }
        ]
      }
    ]);
  });

  test('places on the sub-plans of each acte the other fields', () => {
    expect(
      result.subPlanFields.map(({ acte, subPlanNumbers, fields }) => ({
        acte,
        subPlanNumbers,
        fields: fields.map(
          ({ fieldKey, required, optionValues }) =>
            `${fieldKey}:${required}:${optionValues.join('+')}`
        )
      }))
    ).toEqual([
      {
        acte: 'BOV',
        subPlanNumbers: ['070'],
        fields: [
          'CIBL_POR:true:MAIGRE',
          'productionKind:true:PROD_2',
          'DLCP:true:',
          'TAILOT:false:'
        ]
      },
      {
        acte: 'POR',
        subPlanNumbers: ['071', '072'],
        fields: [
          'CIBL_POR:true:MAIGRE+BOITERIE',
          'DLCP:false:',
          'TECHNTPREL:true:'
        ]
      },
      {
        acte: 'PECHE',
        subPlanNumbers: ['937'],
        fields: ['CIBL_POR:true:MAIGRE+BOITERIE']
      }
    ]);
  });

  test('reports unknown sub-plans and keeps everything own on a plan with sub-plans outside SIGAL', () => {
    expect(result.report.unknownSubPlans).toEqual([
      { acte: 'PECHE', code: '999' }
    ]);
    expect(result.report.plansWithUnmappedSubPlans).toEqual([
      { programmingPlanTitle: 'Plan 2', subPlanNumbers: ['PPV01'] }
    ]);
  });

  test('produces nothing on a database already imported', () => {
    const imported: MaestroState = {
      ...emptyMaestro,
      fields: [
        ...emptyMaestro.fields.map((field) => ({
          ...field,
          options: [
            ...field.options,
            ...result.options
              .filter(({ fieldKey }) => fieldKey === field.key)
              .map(({ fieldKey: _fieldKey, ...option }) => option)
          ]
        })),
        ...result.fields.map(({ key, sachaInDai }) => ({
          key,
          sachaInDai,
          options: result.options
            .filter(({ fieldKey }) => fieldKey === key)
            .map(({ fieldKey: _fieldKey, ...option }) => option)
        }))
      ],
      planFields: [{ programmingPlanId: 'p1', fieldKey: 'sex' }],
      subPlanFields: result.subPlanFields.flatMap(
        ({ subPlanNumbers, fields }) =>
          subPlanNumbers.flatMap((subPlanNumber) =>
            fields.map(({ fieldKey, required, optionValues }) => ({
              subPlanNumber,
              fieldKey,
              inheritance: 'Own' as const,
              required,
              optionValues
            }))
          )
      )
    };

    const secondRun = computeDescriptorImport(workbook, imported);

    expect(secondRun.fields).toEqual([]);
    expect(secondRun.options).toEqual([]);
    expect(secondRun.planFields).toEqual([]);
    expect(secondRun.subPlanFields).toEqual([]);
    expect(secondRun.subPlanFieldReplacements).toEqual([]);
  });

  test('replaces the setting of a reused field already own on a sub-plan', () => {
    const stageWorkbook: SigalWorkbook = {
      acteDescriptors: [link('DAOV', 'STDPRLDV')],
      descriptors: [
        {
          sigle: 'STDPRLDV',
          label: 'Stade de prélèvement',
          standardized: false
        }
      ],
      descriptorValues: [
        {
          sigle: 'STDPRLDV',
          value: 'COM_DET',
          label: 'Commerce de détail',
          status: 'Active'
        },
        {
          sigle: 'STDPRLDV',
          value: 'ETA_ENST',
          label: 'Etablissement d’entreposage et de stockage',
          status: 'Active'
        }
      ],
      subPlans: [
        { acte: 'DAOV', code: '619' },
        { acte: 'BOV', code: '610' }
      ]
    };
    const stageMaestro: MaestroState = {
      subPlans: ['619', '610'].map((subPlanNumber) => ({
        subPlanNumber,
        programmingPlanId: 'p3',
        programmingPlanTitle: 'Plan 3',
        sachaContextSigle: null
      })),
      fields: [
        {
          key: 'stage',
          sachaInDai: false,
          options: [
            {
              value: 'STADE15',
              label: 'Commerce de détail',
              order: 15,
              sachaCommemoratifValueSigle: null
            },
            {
              value: 'STADE37',
              label: 'Mise sur le marché',
              order: 37,
              sachaCommemoratifValueSigle: null
            }
          ]
        }
      ],
      planFields: [],
      subPlanFields: [
        {
          subPlanNumber: '619',
          fieldKey: 'stage',
          inheritance: 'Own',
          required: true,
          optionValues: ['STADE37']
        }
      ]
    };

    const stageImport = computeDescriptorImport(stageWorkbook, stageMaestro);

    expect(stageImport.fields).toEqual([]);
    expect(stageImport.options).toEqual([
      {
        fieldKey: 'stage',
        value: 'ETA_ENST',
        label: 'Etablissement d’entreposage et de stockage',
        order: 38,
        sachaCommemoratifValueSigle: null
      }
    ]);
    expect(stageImport.planFields).toEqual([]);
    expect(stageImport.subPlanFields).toEqual([]);
    expect(stageImport.subPlanFieldReplacements).toEqual([
      {
        subPlanNumber: '619',
        fieldKey: 'stage',
        previous: { required: true, optionValues: ['STADE37'] },
        next: { required: true, optionValues: ['STADE15', 'ETA_ENST'] }
      }
    ]);

    const secondRun = computeDescriptorImport(stageWorkbook, {
      ...stageMaestro,
      subPlanFields: [
        {
          subPlanNumber: '619',
          fieldKey: 'stage',
          inheritance: 'Own',
          required: true,
          optionValues: ['ETA_ENST', 'STADE15']
        }
      ]
    });

    expect(secondRun.subPlanFieldReplacements).toEqual([]);
  });
});
