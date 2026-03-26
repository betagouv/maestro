import { Analysis } from '../../../repositories/analysisRepository';
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
    .andWhere('sample_items.item_number', '=', 1);

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
};
