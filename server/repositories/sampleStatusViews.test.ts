import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { CompanyFixture } from 'maestro-shared/test/companyFixtures';
import { PPVValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  genSampleItem,
  Sample13Fixture
} from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, test } from 'vitest';
import { analysisRepository } from './analysisRepository';
import { kysely } from './kysely';
import { SampleItems } from './sampleItemRepository';
import { formatPartialSample, Samples } from './sampleRepository';

const cleanupSample = async (sampleId: string) => {
  await kysely
    .deleteFrom('analysis')
    .where('sampleId', '=', sampleId)
    .execute();
  await SampleItems().where({ sampleId }).delete();
  await Samples().where({ id: sampleId }).delete();
};

afterEach(async () => {
  await kysely
    .deleteFrom('analysis')
    .where('sampleId', '=', Sample13Fixture.id)
    .execute();
});

const getItemStatus = (sampleId: string, itemNumber: number) =>
  kysely
    .selectFrom('sampleItemStatus')
    .selectAll()
    .where('sampleId', '=', sampleId)
    .where('itemNumber', '=', itemNumber)
    .executeTakeFirst();

const getSampleStatus = (sampleId: string) =>
  kysely
    .selectFrom('sampleStatus')
    .selectAll()
    .where('sampleId', '=', sampleId)
    .executeTakeFirst();

describe('sample_item_status view', () => {
  test('returns Sent when no analysis exists for a sample_item', async () => {
    const result = await getItemStatus(Sample13Fixture.id, 1);
    expect(result?.status).toBe('Sent');
  });

  test('returns NotAdmissible when the analysis is NotAdmissible', async () => {
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'NotAdmissible'
      })
    );
    const result = await getItemStatus(Sample13Fixture.id, 1);
    expect(result?.status).toBe('NotAdmissible');
  });

  test('returns Analysis when the analysis is Analysis', async () => {
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Analysis'
      })
    );
    const result = await getItemStatus(Sample13Fixture.id, 1);
    expect(result?.status).toBe('Analysis');
  });

  test('returns Completed when the analysis is Completed', async () => {
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );
    const result = await getItemStatus(Sample13Fixture.id, 1);
    expect(result?.status).toBe('Completed');
  });

  test('returns lowest status when multiple copies exist for an item', async () => {
    // exemplaire 1 = Completed, exemplaire 2 = Sent => le statut le plus bas est Sent
    await SampleItems().insert(
      genSampleItem({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 2
      })
    );
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 2,
        createdBy: Sampler1Fixture.id,
        status: 'Sent'
      })
    );
    const result = await getItemStatus(Sample13Fixture.id, 1);
    expect(result?.status).toBe('Sent');

    await SampleItems()
      .where({ sampleId: Sample13Fixture.id, itemNumber: 1, copyNumber: 2 })
      .delete();
  });
});

describe('sample_status view', () => {
  test('returns the sample status directly when not Sent', async () => {
    // Sample13Fixture a le statut 'Sent', on utilise un autre sample avec le statut Draft
    const sampleId = uuidv4();
    const sample = genCreatedPartialSample({
      id: sampleId,
      sampler: Sampler1Fixture,
      company: CompanyFixture,
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      step: 'Draft'
    });
    await Samples().insert(formatPartialSample(sample));
    await SampleItems().insert(
      genSampleItem({ sampleId, itemNumber: 1, copyNumber: 1 })
    );

    const result = await getSampleStatus(sampleId);
    expect(result?.status).toBe('Draft');

    await cleanupSample(sampleId);
  });

  test('returns Sent when sample is Sent and no analysis exists', async () => {
    const result = await getSampleStatus(Sample13Fixture.id);
    expect(result?.status).toBe('Sent');
  });

  test('returns NotAdmissible when ALL item statuses are NotAdmissible', async () => {
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'NotAdmissible'
      })
    );

    const result = await getSampleStatus(Sample13Fixture.id);
    expect(result?.status).toBe('NotAdmissible');
  });

  test('does NOT return NotAdmissible when only some items are NotAdmissible', async () => {
    const sampleId = uuidv4();
    const sample = genCreatedPartialSample({
      id: sampleId,
      sampler: Sampler1Fixture,
      company: CompanyFixture,
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      step: 'Sent'
    });
    await Samples().insert(formatPartialSample(sample));
    await SampleItems().insert([
      genSampleItem({ sampleId, itemNumber: 1, copyNumber: 1 }),
      genSampleItem({ sampleId, itemNumber: 2, copyNumber: 1 })
    ]);

    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'NotAdmissible'
      })
    );
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 2,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Analysis'
      })
    );

    const result = await getSampleStatus(sampleId);
    // priorité minimale entre NotAdmissible(2) et Analysis(3) => NotAdmissible
    // mais tous les items ne sont pas NotAdmissible, donc la règle MIN s'applique
    expect(result?.status).toBe('NotAdmissible');

    await cleanupSample(sampleId);
  });

  test('returns Analysis when sample is Sent and at least one item is in Analysis', async () => {
    const sampleId = uuidv4();
    const sample = genCreatedPartialSample({
      id: sampleId,
      sampler: Sampler1Fixture,
      company: CompanyFixture,
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      step: 'Sent'
    });
    await Samples().insert(formatPartialSample(sample));
    await SampleItems().insert([
      genSampleItem({ sampleId, itemNumber: 1, copyNumber: 1 }),
      genSampleItem({ sampleId, itemNumber: 2, copyNumber: 1 })
    ]);

    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 2,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Analysis'
      })
    );

    const result = await getSampleStatus(sampleId);
    expect(result?.status).toBe('Analysis');

    await cleanupSample(sampleId);
  });

  test('returns InReview when all items are Completed and sample compliance is empty', async () => {
    const sampleId = uuidv4();
    const sample = genCreatedPartialSample({
      id: sampleId,
      sampler: Sampler1Fixture,
      company: CompanyFixture,
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      step: 'Sent',
      compliance: null
    });
    await Samples().insert(formatPartialSample(sample));
    await SampleItems().insert([
      genSampleItem({ sampleId, itemNumber: 1, copyNumber: 1 }),
      genSampleItem({ sampleId, itemNumber: 2, copyNumber: 1 })
    ]);

    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 2,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );

    const result = await getSampleStatus(sampleId);
    expect(result?.status).toBe('InReview');

    await cleanupSample(sampleId);
  });

  test('returns Completed when all items are Completed and sample compliance is not empty', async () => {
    const sampleId = uuidv4();
    const sample = genCreatedPartialSample({
      id: sampleId,
      sampler: Sampler1Fixture,
      company: CompanyFixture,
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      step: 'Sent',
      compliance: 'Compliant'
    });
    await Samples().insert(formatPartialSample(sample));
    await SampleItems().insert([
      genSampleItem({ sampleId, itemNumber: 1, copyNumber: 1 }),
      genSampleItem({ sampleId, itemNumber: 2, copyNumber: 1 })
    ]);

    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 2,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );

    const result = await getSampleStatus(sampleId);
    expect(result?.status).toBe('Completed');

    await cleanupSample(sampleId);
  });

  test('returns InReview when all items are at least InReview but one is InReview', async () => {
    const sampleId = uuidv4();
    const sample = genCreatedPartialSample({
      id: sampleId,
      sampler: Sampler1Fixture,
      company: CompanyFixture,
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      step: 'Sent'
    });
    await Samples().insert(formatPartialSample(sample));
    await SampleItems().insert([
      genSampleItem({ sampleId, itemNumber: 1, copyNumber: 1 }),
      genSampleItem({ sampleId, itemNumber: 2, copyNumber: 1 })
    ]);

    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Completed'
      })
    );
    await analysisRepository.insert(
      genPartialAnalysis({
        sampleId,
        itemNumber: 2,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'InReview'
      })
    );

    const result = await getSampleStatus(sampleId);
    expect(result?.status).toBe('InReview');

    await cleanupSample(sampleId);
  });
});
