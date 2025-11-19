import { genCompany } from 'maestro-shared/test/companyFixtures';
import { describe, expect, test } from 'vitest';
import companyRepository from './companyRepository';
import { kysely } from './kysely';

describe('companies findMany', async () => {
  test('filter by dom-tom region', async () => {
    await kysely.deleteFrom('samples').execute();
    await kysely.deleteFrom('userCompanies').execute();
    await kysely.deleteFrom('companies').execute();

    const guyaneCompany = genCompany({
      postalCode: '973000'
    });
    await companyRepository.upsert(guyaneCompany);

    const guadeloupeCompany = genCompany({
      postalCode: '971000'
    });
    await companyRepository.upsert(guadeloupeCompany);

    let companies = await companyRepository.findMany({});

    expect(companies).toHaveLength(2);

    companies = await companyRepository.findMany({ region: '01' });

    expect(companies).toHaveLength(1);
  });
});
