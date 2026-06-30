import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { RaiLabError } from './sachaErrors';
import { buildDaoaAnalysis } from './sachaRAI';
import type { SachaResultats } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

const decodeValidRai = (): SachaResultats => {
  const file = path.join(import.meta.dirname, './example-rai-daoa-valid.xml');
  const json = validateAndDecodeSachaXml(readFileSync(file).toString());
  if (!json.Resultats) {
    throw new Error('Le fichier de test ne contient pas de Resultats');
  }
  return json.Resultats;
};

describe('buildDaoaAnalysis', () => {
  test('construit l’analyse et les résidus depuis un fichier conforme', () => {
    const rai = decodeValidRai();
    const result = buildDaoaAnalysis(rai, 'Multi');

    expect(result.compliance).toBe(true);
    expect(result.status).toBe('Completed');
    expect(result.receiptDate).toBe('2026-05-12');
    expect(result.residues).toHaveLength(64);

    const first = result.residues[0];
    expect(first).toMatchObject({
      residueNumber: 1,
      reference: 'RF-0021-002-PPP', // ALD (1er analyte) via DAOA_RESIDUE_MAPPING
      resultKind: 'ND',
      result: null,
      analysisMethod: 'Multi',
      analysisKind: 'SCREENING',
      compliance: 'Compliant',
      accredited: true,
      ld: 0.001,
      lq: 0.002,
      preciseMethod: 'ANSES PBM Pest LSA-INS-0165',
      analysisDate: '2026-06-23'
    });
  });

  test('reflète la non-accréditation (ACCRDTTN = N)', () => {
    const rai = decodeValidRai();
    const result = buildDaoaAnalysis(rai, 'Multi');

    // 8e analyte du fichier : MTHXCL, non accrédité.
    expect(result.residues[7].accredited).toBe(false);
  });

  test('lève une RaiLabError si un analyte n’est pas mappé', () => {
    const rai = decodeValidRai();
    const unmappedRai: SachaResultats = structuredClone(rai);
    unmappedRai.DialogueResultatType.DialoguePlanAnalyseType![0]
      .DialogueAnalyseType![0].DialogueAnalyse.SigleAnalyte = 'ANALYTE_INCONNU';

    expect(() => buildDaoaAnalysis(unmappedRai, 'Multi')).toThrow(RaiLabError);
    expect(() => buildDaoaAnalysis(unmappedRai, 'Multi')).toThrow(
      /Analyte non mappé/
    );
  });
});
