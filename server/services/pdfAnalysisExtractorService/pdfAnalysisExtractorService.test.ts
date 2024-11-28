
import analysesSnapshots  from './analysis-snapshots.json'
import { snapshotValidator } from './generateTestService';
import { z } from 'zod';
import { Labos, parseDocument } from './pdfAnalysisExtractorService';

describe('pdfAnalysisExtractorService', () => {

  const snapshots = z.array(snapshotValidator).parse(analysesSnapshots)

  test.each(snapshots)('cas réel numéro %#', async ( snapshot) => {

    //FIXME labo name
    await expect( parseDocument[snapshot.laboratoryName as Labos](async (page) => snapshot.input[page -1])).resolves.toBe(snapshot.output)
  })
})