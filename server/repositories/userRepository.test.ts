import { kysely } from './kysely';
import { expect, test } from 'vitest';

test("impossible d'avoir 2 utilisateurs avec le même email", async () => {
  const email = 'email@email.fr'
  await kysely.insertInto('users').values({
    region: '01',
    email,
    roles: ['Sampler'],
    firstName: 'firstName',
    lastName: 'lastName'
  }).execute()
  await kysely.insertInto('users').values({
    region: '02',
    email: 'anotheremail@email.fr',
    roles: ['Sampler'],
    firstName: 'firstName2',
    lastName: 'lastName2'
  }).execute()
  expect(async () =>
  await kysely.insertInto('users').values({
    region: '03',
    email,
    roles: ['Sampler'],
    firstName: 'firstName3',
    lastName: 'lastName3'
  }).execute()).rejects.toThrowErrorMatchingInlineSnapshot(`[error: duplicate key value violates unique constraint "users_email_index"]`)
})