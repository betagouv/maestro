import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { beforeAll, describe, expect, test } from 'vitest';
import { kysely } from './kysely';
import { laboratoryRepository } from './laboratoryRepository';

describe('findByEmailSender', async () => {
  const email = 'monemail@maestro.gouv.fr';
  beforeAll(async () => {
    await kysely
      .updateTable('laboratories')
      .set({
        emailsAnalysisResult: [email]
      })
      .where('name', '=', LaboratoryFixture.name)
      .execute();
  });

  test('not found', async () => {
    const laboratory =
      await laboratoryRepository.findByEmailSender('fakeEmail');
    expect(laboratory).toEqual(undefined);
  });

  test('found', async () => {
    const laboratory = await laboratoryRepository.findByEmailSender(email);
    expect(laboratory?.shortName).toEqual(LaboratoryFixture.shortName);
  });
});
