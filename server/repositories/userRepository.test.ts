import { genUser } from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { expect, test } from 'vitest';
import { kysely } from './kysely';
import { userRepository } from './userRepository';

test("impossible d'avoir 2 utilisateurs avec le même email", async () => {
  const email = 'email@email.fr';

  await kysely.insertInto('users').values(genUser({ email })).execute();
  await kysely
    .insertInto('users')
    .values(genUser({ email: 'anotheremail@email.fr' }))
    .execute();

  await expect(async () =>
    kysely
      .insertInto('users')
      .values(
        genUser({
          email
        })
      )
      .execute()
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[error: duplicate key value violates unique constraint "users_email_index"]`
  );
});

test("peut modifier le nom et le prénom d'un utilisateur", async () => {
  const user1 = genUser();
  const user2 = genUser();

  await kysely.insertInto('users').values(user1).execute();
  await kysely.insertInto('users').values(user2).execute();

  const newLastName = 'newLastName';
  const newFirstName = 'newFirstName';

  await userRepository.update(
    {
      lastName: newLastName,
      firstName: newFirstName
    },
    user1.id
  );

  const user1InDb = await kysely
    .selectFrom('users')
    .selectAll()
    .where('email', '=', user1.email)
    .executeTakeFirst();
  expect(user1InDb).toMatchObject({
    lastName: newLastName,
    firstName: newFirstName
  });

  const user2InDb = await kysely
    .selectFrom('users')
    .selectAll()
    .where('email', '=', user2.email)
    .executeTakeFirst();
  expect(user2InDb).toMatchObject(user2);
});
test('peut ajouter et supprimer un logged secret', async () => {
  const user1 = genUser();

  await kysely.insertInto('users').values(user1).execute();

  const newSecret = uuidv4();

  await userRepository.addLoggedSecret(newSecret, user1.id);

  let user1InDb = await userRepository.findUnique(user1.id);

  expect(user1InDb?.loggedSecrets).toEqual([newSecret]);

  const newSecret2 = uuidv4();
  await userRepository.addLoggedSecret(newSecret2, user1.id);
  await userRepository.deleteLoggedSecret(newSecret, user1.id);

  user1InDb = await userRepository.findUnique(user1.id);
  expect(user1InDb?.loggedSecrets).toEqual([newSecret2]);
});
