import { z } from 'zod';
import analysesSnapshots from './analysis-snapshots.json';
import { snapshotValidator } from './generateTestService';
import { Labos, parseDocument } from './pdfAnalysisExtractorService';
import { describe, expect, test } from 'vitest';

describe('pdfAnalysisExtractorService', () => {
  const snapshots = z.array(snapshotValidator).parse(analysesSnapshots);

  test.each(snapshots)('cas réel numéro %#', async (snapshot) => {
    //FIXME labo name
    await expect(
      parseDocument[snapshot.laboratoryName as Labos](
        async (page) => ({ valid: true, content: snapshot.input[page - 1] })
      )
    ).resolves.toBe(snapshot.output);
  });
});
