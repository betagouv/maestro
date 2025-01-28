import { describe, expect, test } from 'vitest';
import { extractAnalyzes } from './inovalys';

describe('Parse correctement les fichiers CSV', () => {
  test('Vérifie la présence des fichiers CSV', () => {

    expect(() => extractAnalyzes([])).toThrowErrorMatchingInlineSnapshot(`[Error: Aucun fichier CSV pour les résultats de trouvé.]`)
    expect(() => extractAnalyzes([{fileName: 'test.csv', content: []}])).toThrowErrorMatchingInlineSnapshot(`[Error: Aucun fichier CSV pour les résultats de trouvé.]`)
    expect(() => extractAnalyzes([{fileName: 'FILE_FICRES.csv', content: []}])).toThrowErrorMatchingInlineSnapshot(`[Error: Aucun fichier CSV pour l'échantillon de trouvé.]`)
    expect(() => extractAnalyzes([{fileName: 'FILE_FICRES.csv', content: []}, {fileName: 'test.csv', content: []}])).toThrowErrorMatchingInlineSnapshot(`[Error: Aucun fichier CSV pour l'échantillon de trouvé.]`)
    expect(() => extractAnalyzes([{fileName: 'FILE_FICRES.csv', content: []}, {fileName: 'FILE_FICECH.csv', content: []}])).toThrowErrorMatchingInlineSnapshot(`[Error: Aucune donnée trouvée dans le fichier d'échantillon]`)
  })
})