import { beforeAll, describe, expect, test } from 'vitest';
import { laboratoryRepository } from './laboratoryRepository';
import { kysely } from './kysely';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';

describe('findByEmailSender', async () => {

  const email = 'monemail@maestro.gouv.fr'
  beforeAll(async () => {

    await kysely.updateTable('laboratories')
      .set({
        emailsAnalysisResult: [email]
      })
      .where('name', '=', LaboratoryFixture.name)
      .execute()
  })

  test('not found', async () => {
    const laboratory = await laboratoryRepository.findByEmailSender('fakeEmail');
    expect(laboratory).toEqual(undefined);
  })


  test('found', async () => {
    const laboratory = await laboratoryRepository.findByEmailSender(email);
    expect(laboratory?.name).toEqual(LaboratoryFixture.name);
  })
});
