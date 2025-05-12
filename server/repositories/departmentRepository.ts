import { Department } from 'maestro-shared/referential/Department';
import { kysely } from './kysely';
import { sql } from 'kysely';


const getDepartement = async (x: number | undefined, y: number | undefined) : Promise<Department | null> => {

  if (x === undefined || y === undefined) {
    return null
  }

  const d = await kysely.selectFrom('departments').select('id').execute()
  console.log(d)

  const departement = await kysely
    .selectFrom('departments')
    .select('id')
    .where(({eb}) => {
      return eb.fn('ST_CONTAINS', ['geometry', sql.raw(`ST_POINT(${y}, ${x}, 4326)`)])
    })
    .executeTakeFirst();

  return Department.safeParse(departement?.id).data ?? null

}

export const departmentRepository = {
  getDepartement
}