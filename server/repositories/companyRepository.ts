import { isNil, omitBy } from 'lodash-es';
import { Regions } from 'maestro-shared/referential/Region';
import { Company } from 'maestro-shared/schema/Company/Company';
import { FindCompanyOptions } from 'maestro-shared/schema/Company/FindCompanyOptions';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import z from 'zod';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

export const companiesTable = 'companies';

const CompanyDbo = z.object({
  ...Company.omit({
    geolocation: true
  }).shape,
  geolocation: z.any().nullish()
});

type CompanyDbo = z.infer<typeof CompanyDbo>;

export const Companies = () => db<CompanyDbo>(companiesTable);

const findUnique = async (siret: string): Promise<Company | undefined> => {
  console.info('Find company', siret);
  return Companies()
    .where({
      siret
    })
    .first()
    .then((_) => _ && Company.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindCompanyOptions
): Promise<Company[]> => {
  console.info('Find companies', omitBy(findOptions, isNil));

  let query = kysely.selectFrom('companies').selectAll().orderBy('name');

  for (const option of FindCompanyOptions.keyof().options) {
    switch (option) {
      case 'region':
        if (!isNil(findOptions.region)) {
          //Les DOM TOM c'est sur 3 digits, l'hexagone c'est sur 2
          const regionDigitSize =
            Regions[findOptions.region].departments[0].length;

          query = query.where((eb) =>
            eb(
              eb.fn('left', ['postalCode', eb.val(regionDigitSize)]),
              'in',
              Regions[findOptions.region!].departments.map(String)
            )
          );
        }

        break;
      case 'department':
        if (!isNil(findOptions.department)) {
          query = query.where(
            'postalCode',
            'ilike',
            `${findOptions.department}%`
          );
        }
        break;
      case 'kinds':
        if (!isNil(findOptions.kinds) && findOptions.kinds.length > 0) {
          query = query.where('kinds', '@>', [findOptions.kinds]);
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  const companies: Company[] = await query.execute();

  return companies.map((_: any) => Company.parse(_));
};

const upsert = async (company: Company): Promise<Company> => {
  console.info('Upsert company', company.siret);
  return Companies()
    .insert({
      ...company,
      geolocation: company.geolocation
        ? db.raw('Point(?, ?)', [company.geolocation.x, company.geolocation.y])
        : null
    })
    .onConflict('siret')
    .merge()
    .then(() => company);
};

export default {
  findUnique,
  findMany,
  upsert
};
