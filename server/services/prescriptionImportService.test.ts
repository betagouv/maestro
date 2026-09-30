import { describe, expect, test } from 'vitest';
import { parsePrescriptionImportFile } from './prescriptionImportService';

const csvCell = (value: string): string =>
  /[;\n"]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const csv = (rows: string[][]): Buffer =>
  Buffer.from(
    rows.map((row) => row.map(csvCell).join(';')).join('\n'),
    'utf-8'
  );

const parse = (rows: string[][]) =>
  parsePrescriptionImportFile(csv(rows), 'export.csv');

describe('parsePrescriptionImportFile', () => {
  test('lit les colonnes régions et le total national', () => {
    const { cells, totals, unrecognized } = parse([
      ['Sous-plan', 'Total national programmé', 'ARA', 'BRE'],
      ['DAOA01', '30', '12', '18']
    ]);

    expect(unrecognized).toEqual([]);
    expect(totals).toEqual([
      { rowNumber: 2, subPlanNumber: 'DAOA01', sampleCount: 30 }
    ]);
    expect(
      cells.map(({ scope, sampleCount }) => ({ scope, sampleCount }))
    ).toEqual([
      { scope: { echelon: 'Region', region: '84' }, sampleCount: 12 },
      { scope: { echelon: 'Region', region: '53' }, sampleCount: 18 }
    ]);
  });

  test('lit les colonnes départements', () => {
    const { cells, unrecognized } = parse([
      ['Sous-plan', 'Département 44\nProgrammés', 'Département 85\nProgrammés'],
      ['DAOA01', '7', '3']
    ]);

    expect(unrecognized).toEqual([]);
    expect(
      cells.map(({ scope, sampleCount }) => ({ scope, sampleCount }))
    ).toEqual([
      { scope: { echelon: 'Department', department: '44' }, sampleCount: 7 },
      { scope: { echelon: 'Department', department: '85' }, sampleCount: 3 }
    ]);
  });

  test('rattache les colonnes établissements au département qui les précède', () => {
    const { cells, unrecognized } = parse([
      [
        'Sous-plan',
        'Département 44\nProgrammés',
        'CELTIC RIVERS\n88181830600014\nProgrammés',
        '12345678901234\nProgrammés'
      ],
      ['DAOA01', '9', '5', '4']
    ]);

    expect(unrecognized).toEqual([]);
    expect(cells.map(({ scope }) => scope)).toEqual([
      { echelon: 'Department', department: '44' },
      {
        echelon: 'Company',
        department: '44',
        companySiret: '88181830600014'
      },
      {
        echelon: 'Company',
        department: '44',
        companySiret: '12345678901234'
      }
    ]);
  });

  test('signale une colonne établissement sans département', () => {
    const { cells, unrecognized } = parse([
      ['Sous-plan', 'CELTIC RIVERS\n88181830600014\nProgrammés'],
      ['DAOA01', '5']
    ]);

    expect(cells).toEqual([]);
    expect(unrecognized).toEqual(['Colonne B']);
  });

  test('ignore les colonnes laboratoires et les colonnes descriptives', () => {
    const { cells, unrecognized } = parse([
      [
        'Sous-plan',
        'Matrice',
        'Notes',
        'Département 44\nLaboratoire mono',
        'Département 44\nProgrammés'
      ],
      ['DAOA01', 'Foie de bovin', 'une note', 'CAP 29', '6']
    ]);

    expect(unrecognized).toEqual([]);
    expect(cells).toHaveLength(1);
    expect(cells[0].scope).toEqual({ echelon: 'Department', department: '44' });
  });

  test('signale une cellule dont la quantité est invalide', () => {
    const { cells, unrecognized } = parse([
      ['Sous-plan', 'Département 44\nProgrammés'],
      ['DAOA01', 'beaucoup']
    ]);

    expect(cells).toEqual([]);
    expect(unrecognized).toEqual(['Cellule B2']);
  });

  test('ignore les lignes sans numéro de sous-plan', () => {
    const { cells } = parse([
      ['Sous-plan', 'Département 44\nProgrammés'],
      ['', '5'],
      ['DAOA01', '8']
    ]);

    expect(cells).toHaveLength(1);
    expect(cells[0].rowNumber).toBe(3);
  });
});
