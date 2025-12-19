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

  test('filter by kinds with intersection', async () => {
    await kysely.deleteFrom('samples').execute();
    await kysely.deleteFrom('userCompanies').execute();
    await kysely.deleteFrom('companies').execute();

    const meatCompany = genCompany({
      kinds: ['MEAT_SLAUGHTERHOUSE']
    });
    await companyRepository.upsert(meatCompany);

    const poultryCompany = genCompany({
      kinds: ['POULTRY_SLAUGHTERHOUSE']
    });
    await companyRepository.upsert(poultryCompany);

    const bothKindsCompany = genCompany({
      kinds: ['MEAT_SLAUGHTERHOUSE', 'POULTRY_SLAUGHTERHOUSE']
    });
    await companyRepository.upsert(bothKindsCompany);

    const noKindsCompany = genCompany({
      kinds: null
    });
    await companyRepository.upsert(noKindsCompany);

    let companies = await companyRepository.findMany({
      kinds: ['MEAT_SLAUGHTERHOUSE']
    });
    expect(companies).toHaveLength(2);
    expect(companies.map((c) => c.siret).sort()).toEqual(
      [meatCompany.siret, bothKindsCompany.siret].sort()
    );

    companies = await companyRepository.findMany({
      kinds: ['POULTRY_SLAUGHTERHOUSE']
    });
    expect(companies).toHaveLength(2);
    expect(companies.map((c) => c.siret).sort()).toEqual(
      [poultryCompany.siret, bothKindsCompany.siret].sort()
    );

    companies = await companyRepository.findMany({
      kinds: ['MEAT_SLAUGHTERHOUSE', 'POULTRY_SLAUGHTERHOUSE']
    });
    expect(companies).toHaveLength(3);
    expect(companies.map((c) => c.siret).sort()).toEqual(
      [meatCompany.siret, poultryCompany.siret, bothKindsCompany.siret].sort()
    );

    companies = await companyRepository.findMany({});
    expect(companies).toHaveLength(4);
  });
});
