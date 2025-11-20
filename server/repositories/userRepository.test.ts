import { SlaughterhouseCompanyFixture1 } from 'maestro-shared/test/companyFixtures';
import { genUser } from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { expect, test } from 'vitest';
import { userRepository } from './userRepository';

test("impossible d'avoir 2 utilisateurs avec le même email", async () => {
  const email = 'email@email.fr';

  await userRepository.insert(genUser({ email }));
  await userRepository.insert(genUser({ email: 'anotheremail@email.fr' }));

  await expect(async () =>
    userRepository.insert(genUser({ email }))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[error: duplicate key value violates unique constraint "users_email_index"]`
  );
});

test("peut modifier le nom et le prénom d'un utilisateur", async () => {
  const user1 = genUser({});
  const user2 = genUser({});

  await userRepository.insert(user1);
  await userRepository.insert(user2);

  const newName = 'fullName';

  await userRepository.update(
    {
      name: newName
    },
    user1.id
  );

  const user1InDb = await userRepository.findOne(user1.email);
  expect(user1InDb).toMatchObject({
    name: newName
  });

  const user2InDb = await userRepository.findOne(user2.email);
  expect(user2InDb).toMatchObject(user2);
});

test('peut ajouter une entreprise à un utilisateur', async () => {
  const user1 = genUser({
    companies: []
  });

  await userRepository.insert(user1);

  let user1InDb = await userRepository.findOne(user1.email);
  expect(user1InDb?.companies).toHaveLength(0);

  await userRepository.update(
    {
      companies: [SlaughterhouseCompanyFixture1]
    },
    user1.id
  );

  user1InDb = await userRepository.findOne(user1.email);
  expect(user1InDb?.companies).toHaveLength(1);
  expect(user1InDb?.companies?.[0]?.siret).toEqual(
    SlaughterhouseCompanyFixture1.siret
  );
});

test('peut ajouter et supprimer un logged secret', async () => {
  const user1 = genUser({});

  await userRepository.insert(user1);

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
