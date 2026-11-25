import { sql } from 'kysely';
import {
  type Department,
  departementValidator
} from 'maestro-shared/referential/Department';
import { newKysely2 } from './kysely';

const getDepartment = async (
  x: number | undefined,
  y: number | undefined
): Promise<Department | null> => {
  if (x === undefined || y === undefined) {
    return null;
  }

  const department = await newKysely2
    .selectFrom('departments')
    .select('id')
    .where(({ eb }) => {
      return eb.fn('ST_CONTAINS', [
        'geometry',
        sql.raw(`ST_POINT(${y}, ${x}, 4326)`)
      ]);
    })
    .executeTakeFirst();

  return departementValidator.safeParse(department?.id).data ?? null;
};

export const departmentRepository = {
  getDepartment
};
