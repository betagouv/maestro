// Usage: ts-node analysisFineTuning

import fs from 'fs';
import highland from 'highland';
import z from 'zod';
import { extractAnalysisFromReportPrompt } from '../../server/prompts/extractAnalysisFromReport.prompt';
import analysisRepository from '../../server/repositories/analysisRepository';
import sampleRepository from '../../server/repositories/sampleRepository';
import {
  AnalysisExtraction,
  ResidueExtraction,
} from '../../server/services/analysisService/analysisService';
import documentService from '../../server/services/documentService/documentService';

const myfile = fs.createWriteStream('samplesAnalysisReport.jsonl');

const ResidueExtractionWithDefault = ResidueExtraction.extend({
  analytes: ResidueExtraction.shape.analytes.default([]),
  notesOnResult: ResidueExtraction.shape.notesOnResult.default(''),
}).omit({
  reference: true,
});

const AnalysisExtractionWithDefault = AnalysisExtraction.extend({
  residues: z.array(ResidueExtractionWithDefault).default([]),
  notesOnCompliance: AnalysisExtraction.shape.notesOnCompliance.default(''),
});

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
            content: JSON.stringify(
              AnalysisExtractionWithDefault.parse(analysis)
            ),
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
