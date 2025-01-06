import { kysely } from './kysely';
import { expect, test } from 'vitest';
import { genUser } from '../../shared/test/userFixtures';

test("impossible d'avoir 2 utilisateurs avec le même email", async () => {
  const email = 'email@email.fr'

  await kysely.insertInto('users').values(genUser({email})).execute()
  await kysely.insertInto('users').values(genUser({ email: 'anotheremail@email.fr'})).execute()

  expect(async () =>
  await kysely.insertInto('users').values(genUser({
    email,
  })).execute()).rejects.toThrowErrorMatchingInlineSnapshot(`[error: duplicate key value violates unique constraint "users_email_index"]`)
})