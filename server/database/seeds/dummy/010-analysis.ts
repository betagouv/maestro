import { faker } from '@faker-js/faker';
import { Analysis } from '../../../repositories/analysisRepository';
import { kysely } from '../../../repositories/kysely';
import { Samples } from '../../../repositories/sampleRepository';

export const seed = async () => {
  const sampleWithoutAnalysis = await Samples()
    .select('samples.id', 'sample_items.item_number')
    .join('sample_items', 'samples.id', 'sample_items.sample_id')
    .leftJoin('analysis', (query) =>
      query
        .on('analysis.sample_id', '=', 'sample_items.sample_id')
        .andOn('analysis.item_number', '=', 'sample_items.item_number')
        .andOn('analysis.copy_number', '=', 'sample_items.copy_number')
    )
    .whereNull('analysis.sample_id')
    .andWhere('step', 'Sent')
    .andWhere('sample_items.copy_number', '=', 1);

  if (sampleWithoutAnalysis.length > 0) {
    await Analysis().insert(
      sampleWithoutAnalysis.map((sample) => ({
        sample_id: sample.id,
        item_number: sample.itemNumber,
        copy_number: 1,
        status: 'Sent'
      }))
    );
  }

  const analysisWithoutDai = await Analysis()
    .join('samples', 'samples.id', 'analysis.sample_id')
    .whereNotNull('samples.sent_at')
    .whereNotExists((query) =>
      query
        .select(1)
        .from('analysis_dai')
        .whereRaw('analysis_dai.analysis_id = analysis.id')
    )
    .select('analysis.id', 'samples.sent_at');

  if (analysisWithoutDai.length > 0) {
    await kysely
      .insertInto('analysisDai')
      .values(
        analysisWithoutDai.map((analysis) => ({
          analysisId: analysis.id,
          state: 'SENT' as const,
          sentMethod: 'EMAIL' as const,
          edi: false,
          sentAt: new Date(
            new Date(analysis.sentAt).getTime() +
              faker.number.int({ min: 1, max: 48 }) * 60 * 60 * 1000
          )
        }))
      )
      .execute();
  }
};
