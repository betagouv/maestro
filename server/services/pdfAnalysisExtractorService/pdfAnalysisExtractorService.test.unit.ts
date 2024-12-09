import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import analysesSnapshots from './analysis-snapshots.json';
import { snapshotValidator } from './generateTestService';
import { Labos, parseDocument } from './pdfAnalysisExtractorService';

describe('pdfAnalysisExtractorService', () => {
  const snapshots = z.array(snapshotValidator).parse(analysesSnapshots);

  const toTest: number = 1;
  test.each(snapshots.slice(toTest, toTest + 1))(
    'cas réel numéro %#',
    async (snapshot) => {
      //FIXME labo name
      await expect(
        parseDocument[snapshot.laboratoryName as Labos](async (page) => ({
          valid: true,
          content: snapshot.input[page - 1]
        })),
        `"file:///home/vmaubert/GIT/maestro/.terraform/${snapshot.documentId}_${snapshot.fileName}"`
      ).resolves.toStrictEqual(snapshot.output);
    }
  );

});
