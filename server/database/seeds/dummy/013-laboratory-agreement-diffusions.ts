import { AdminBGIRFixture } from 'maestro-shared/test/userFixtures';
import { kysely } from '../../../repositories/kysely';

export const seed = async () => {
  const currentYear = new Date().getFullYear();

  //L'année en cours et la précédente sont diffusées, la suivante reste à diffuser
  await kysely
    .insertInto('laboratoryAgreementDiffusions')
    .values(
      [currentYear - 1, currentYear].map((year) => ({
        year,
        diffusedAt: new Date(`${year}-02-13`),
        diffusedBy: AdminBGIRFixture.id
      }))
    )
    .execute();
};
