import { sql } from 'kysely';
import { z } from 'zod';
import { kysely } from '../../../repositories/kysely';
import { Department, DepartmentList } from 'maestro-shared/referential/Department';

const geojsonValidator = z.object({
  features: z.array(
    z.object({
      properties: z.object({
        code: z.string()
      }),
      geometry: z.unknown()
    })
  )
});

export const departmentsSeed = async () => {

  const query = await fetch(
    'https://etalab-datasets.geo.data.gouv.fr/contours-administratifs/latest/geojson/departements-5m.geojson'
  );
  const result = geojsonValidator.parse(await query.json());

  await kysely.deleteFrom('departments').execute();
  for (const feature of result.features.filter(f => DepartmentList.includes(f.properties.code as Department))) {
    const postgisGeometry = await sql<{
      result: unknown;
    }>`select ST_MakeValid(ST_MULTI(ST_SetSRID(ST_GeomFromGeoJSON('${sql.raw(JSON.stringify(feature.geometry))}'), 4326))) as result`.execute(
      kysely
    );
    await kysely
      .insertInto('departments')
      .values([
        {
          id: feature.properties.code,
          geometry: postgisGeometry.rows[0].result
        }
      ])
      .execute();
  }
};