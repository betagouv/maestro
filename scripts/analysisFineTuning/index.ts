// Usage: ts-node analysisFineTuning

import fs from 'fs';
import highland from 'highland';
import { extractAnalysisFromReportPrompt } from '../../server/prompts/extractAnalysisFromReport.prompt';
import analysisRepository from '../../server/repositories/analysisRepository';
import sampleRepository from '../../server/repositories/sampleRepository';
import { AnalysisExtraction } from '../../server/services/analysisService/analysisService';
import documentService from '../../server/services/documentService/documentService';

const myfile = fs.createWriteStream('samplesAnalysisReport.jsonl');

highland(
  sampleRepository.findMany({
    status: 'Completed',
  })
)
  .flatten()
  .flatMap((sample) =>
    highland(
      analysisRepository
        .findUnique({
          sampleId: sample.id,
        })
        .then((analysis) => ({ sample, analysis }))
    )
  )
  .flatMap(({ analysis }) =>
    highland(
      documentService
        .getDocumentContent(analysis?.reportDocumentId as string)
        .then((content) => ({ content, analysis }))
    )
  )
  .each(({ content, analysis }) => {
    myfile.write(
      JSON.stringify({
        messages: [
          ...extractAnalysisFromReportPrompt(content),
          {
            role: 'assistant',
            content: JSON.stringify(AnalysisExtraction.parse(analysis)),
          },
        ],
      })
    );
    myfile.write('\n');
  })
  .done(() => {
    myfile.end();
    console.log('All samples have been processed');
  });
