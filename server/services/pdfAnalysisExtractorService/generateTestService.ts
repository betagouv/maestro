import { kysely } from '../../repositories/kysely';
import { writeFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist';
import { extractPageContent } from './pdfAnalysisExtractorService';
import { z } from 'zod';


export const snapshotValidator = z.object({
  analysisId: z.string(),
  fileName: z.string(),
  laboratoryName: z.string(),
  output: z.array(z.object(
    {reference: z.string().nullable() ,
    lmr: z.number().nullable(),
    result: z.number().nullable()
    }
  )),
  input: z.array(z.array(z.string()
  ))
})
type Snapshot = z.infer<typeof snapshotValidator>

const generateTests = async (): Promise<void> => {

  //Génère les snashots
  const analysisWithDocument = await kysely
    .selectFrom('analysis')
    .innerJoin('documents', 'documents.id', 'analysis.reportDocumentId')
    .innerJoin('samples', 'samples.id', 'analysis.sampleId')
    .innerJoin('laboratories', 'laboratories.id', 'samples.laboratoryId')
    .where('analysis.reportDocumentId','is not', null)
    .select(['analysis.id as analysisId', 'documents.filename as fileName','documents.id as documentId', 'laboratories.name as laboratoryName'])
    .execute();


  const snapshots : Snapshot[] = []
  for (const analysis of analysisWithDocument) {

    const residues = await kysely.selectFrom('analysisResidues')
      .where('analysisId', '=', analysis.analysisId)
      .select(['reference', 'lmr', 'result'])
      .execute()

    //FIXME path
    const doc = await getDocument(
      `../../../.terraform/${analysis.documentId}_${analysis.fileName}`
    ).promise;

    const input = []
    //Anonymise les rapports
    switch (analysis.laboratoryName){
      //FIXME
      case 'LDA 72': {
        const page2 = await extractPageContent(doc, 2)
        const startIndex = page2.findIndex(s => s.startsWith('ND'))
        const endIndex = page2.findIndex(s => s.startsWith('Approuvé'))
        if( startIndex === -1 || endIndex === -1){
          console.error(`fichier ${analysis.documentId}_${analysis.fileName} ignoré car non conforme`)
          continue
        }
        input.push(...[[], page2.slice(startIndex, endIndex)])
        break
      }
      case 'GIR 49': {
        const page: Array<string> = await extractPageContent(doc, 1)
        const startIndex = page.findIndex(s => s === 'Méthode')
        const endIndex = page.findLastIndex(s => s.startsWith('RAPPORT'))
        if (startIndex === -1 || endIndex === -1) {
          console.error(`fichier ${analysis.documentId}_${analysis.fileName} ignoré car non conforme`)
          continue
        }
        input.push(page.slice(startIndex, endIndex))
        break
      }
      default:
        console.error(`Laboratoire inconnu : `, analysis.laboratoryName)
    }

    snapshots.push({...analysis, input, output: residues})

  }

  //FIXME path
  // writeFileSync(`server/services/pdfAnalysisExtractorServicejson/analysis-snapshots.json`, JSON.stringify(snapshots))
  writeFileSync(`analysis-snapshots.json`, JSON.stringify(snapshots))

console.log('Snapshots générés : ', snapshots.length)


};
generateTests()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
