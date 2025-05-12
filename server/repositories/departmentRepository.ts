import { Department } from 'maestro-shared/referential/Department';
import { kysely } from './kysely';
import { sql } from 'kysely';


const getDepartement = async (longitude: number, latitude: number) : Promise<Department | null> => {


  const departement = await kysely
    .selectFrom('departments')
    .select('id')
    .where(({eb}) => {
      return eb.fn('ST_CONTAINS', ['geometry', sql.raw(`ST_POINT(${longitude}, ${latitude}, 4326)`)])
    })
    .executeTakeFirst()

  return Department.safeParse(departement?.id).data ?? null

}

export const departmentRepository = {
  getDepartement
}