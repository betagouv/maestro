import {
  PesticideResidueDomainId,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { afterEach, describe, expect, test } from 'vitest';
import { kysely } from './kysely';

const planYear = async (id: string) =>
  (
    await kysely
      .selectFrom('programmingPlans')
      .select('year')
      .where('id', '=', id)
      .executeTakeFirstOrThrow()
  ).year;

describe('programming plan domain year consistency', () => {
  afterEach(async () => {
    await kysely
      .updateTable('programmingPlanDomains')
      .set({ year: PPVValidatedProgrammingPlanFixture.year })
      .where('id', '=', PesticideResidueDomainId)
      .execute();
  });

  test('should reject a plan year that no longer matches its domain year', async () => {
    await expect(
      kysely
        .updateTable('programmingPlans')
        .set({ year: PPVValidatedProgrammingPlanFixture.year + 1 })
        .where('id', '=', PPVValidatedProgrammingPlanFixture.id)
        .execute()
    ).rejects.toThrow('programming_plans_domain_id_year_foreign');
  });

  test('should cascade a domain year update to its plans', async () => {
    await kysely
      .updateTable('programmingPlanDomains')
      .set({ year: PPVValidatedProgrammingPlanFixture.year + 5 })
      .where('id', '=', PesticideResidueDomainId)
      .execute();

    expect(await planYear(PPVValidatedProgrammingPlanFixture.id)).toBe(
      PPVValidatedProgrammingPlanFixture.year + 5
    );
  });
});
