import { SlaughterhouseCompanyFixture1 } from 'maestro-shared/test/companyFixtures';
import {
  DAOABovinValidatedSubPlanFixture,
  DAOAVolailleValidatedSubPlanFixture,
  PPVValidatedSubPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { genUser } from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test } from 'vitest';
import { userRepository } from './userRepository';

const PPVStages = PPVValidatedSubPlanFixture.stages;
const AbattoirStages = DAOAVolailleValidatedSubPlanFixture.stages;

test("impossible d'avoir 2 utilisateurs avec le même email", async () => {
  const email = 'email@email.fr';

  await userRepository.insert(genUser({ email }));
  await userRepository.insert(genUser({ email: 'ANOTHEREMAIL@email.fr' }));

  await expect(async () =>
    userRepository.insert(genUser({ email }))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[error: duplicate key value violates unique constraint "users_email_index"]`
  );
});

test("déduplique les entreprises identiques lors de la création d'un utilisateur", async () => {
  const user = genUser({
    companies: [SlaughterhouseCompanyFixture1, SlaughterhouseCompanyFixture1]
  });

  await userRepository.insert(user);

  const userInDb = await userRepository.findOne(user.email);
  expect(userInDb?.companies).toHaveLength(1);
  expect(userInDb?.companies?.[0]?.siret).toEqual(
    SlaughterhouseCompanyFixture1.siret
  );
});

test('déduplique les entreprises identiques lors de la mise à jour', async () => {
  const user = genUser({ companies: [] });

  await userRepository.insert(user);

  await userRepository.update(
    {
      companies: [SlaughterhouseCompanyFixture1, SlaughterhouseCompanyFixture1]
    },
    user.id
  );

  const userInDb = await userRepository.findOne(user.email);
  expect(userInDb?.companies).toHaveLength(1);
  expect(userInDb?.companies?.[0]?.siret).toEqual(
    SlaughterhouseCompanyFixture1.siret
  );
});

test("peut modifier le nom et le prénom d'un utilisateur", async () => {
  const user1 = genUser({
    roles: ['Administrator']
  });
  const user2 = genUser({
    roles: ['Administrator']
  });

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

test('filtre les utilisateurs sur leur désactivation', async () => {
  const enabledUser = genUser({ disabled: false });
  const disabledUser = genUser({ disabled: true });

  await userRepository.insert(enabledUser);
  await userRepository.insert(disabledUser);

  const users = await userRepository.findMany({ disabled: null });
  const emails = users.map((u) => u.email);
  expect(emails).toContain(enabledUser.email);
  expect(emails).toContain(disabledUser.email);

  const disabledUsers = await userRepository.findMany({ disabled: true });
  const disabledEmails = disabledUsers.map((u) => u.email);
  expect(disabledEmails).toContain(disabledUser.email);
  expect(disabledEmails).not.toContain(enabledUser.email);

  const enabledUsers = await userRepository.findMany({ disabled: false });
  const enabledEmails = enabledUsers.map((u) => u.email);
  expect(enabledEmails).toContain(enabledUser.email);
  expect(enabledEmails).not.toContain(disabledUser.email);
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

describe('stades de prélèvement', () => {
  test('persiste les stades et dérive les sous-plans de tous les millésimes', async () => {
    const user = genUser({
      roles: ['NationalObserver'],
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });

    await userRepository.insert(user);

    const userInDb = await userRepository.findOne(user.email);
    expect(userInDb?.stages).toEqual(PPVStages);

    const derived = userInDb?.programmingSubPlans ?? [];
    expect(derived.every((sp) => sp.subPlanNumber === 'PPV')).toBe(true);
    expect(
      new Set(derived.map((sp) => sp.programmingPlanId)).size
    ).toBeGreaterThan(1);
  });

  test('le stade abattoir dérive M01 et M02, indissociables', async () => {
    const user = genUser({
      roles: ['NationalObserver'],
      programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
    });

    await userRepository.insert(user);

    const userInDb = await userRepository.findOne(user.email);
    expect(userInDb?.stages).toEqual(AbattoirStages);
    expect(
      new Set(userInDb?.programmingSubPlans.map((sp) => sp.subPlanNumber))
    ).toEqual(new Set(['M01', 'M02']));
  });

  test('ignore les sous-plans fournis à la création, ils sont dérivés', async () => {
    const user = genUser({
      roles: ['NationalObserver'],
      stages: AbattoirStages,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });

    await userRepository.insert(user);

    const userInDb = await userRepository.findOne(user.email);
    expect(userInDb?.stages).toEqual(AbattoirStages);
    expect(
      userInDb?.programmingSubPlans.every((sp) => sp.subPlanNumber !== 'PPV')
    ).toBe(true);
  });

  test('recalcule les sous-plans dérivés après mise à jour des stades', async () => {
    const user = genUser({
      roles: ['NationalObserver'],
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });

    await userRepository.insert(user);

    await userRepository.update({ stages: AbattoirStages }, user.id);

    const userInDb = await userRepository.findUnique(user.id);
    expect(userInDb?.stages).toEqual(AbattoirStages);
    expect(
      new Set(userInDb?.programmingSubPlans.map((sp) => sp.subPlanNumber))
    ).toEqual(new Set(['M01', 'M02']));
  });

  test('un rôle non restreint sans stade ne dérive aucun sous-plan', async () => {
    const user = genUser({ roles: ['Administrator'] });

    await userRepository.insert(user);

    const userInDb = await userRepository.findOne(user.email);
    expect(userInDb?.stages).toEqual([]);
    expect(userInDb?.programmingSubPlans).toEqual([]);
  });
});

describe('findMany par stade', () => {
  test('retient les utilisateurs partageant au moins un stade', async () => {
    const ppvUser = genUser({
      roles: ['NationalObserver'],
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });
    const abattoirUser = genUser({
      roles: ['NationalObserver'],
      programmingSubPlans: [DAOABovinValidatedSubPlanFixture]
    });

    await userRepository.insert(ppvUser);
    await userRepository.insert(abattoirUser);

    const emails = (
      await userRepository.findMany({
        stages: [PPVStages[0]],
        disabled: null
      })
    ).map((u) => u.email);

    expect(emails).toContain(ppvUser.email);
    expect(emails).not.toContain(abattoirUser.email);
  });

  test('accepte un stade seul autant qu une liste', async () => {
    const abattoirUser = genUser({
      roles: ['NationalObserver'],
      programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
    });

    await userRepository.insert(abattoirUser);

    const emails = (
      await userRepository.findMany({
        stages: AbattoirStages[0],
        disabled: null
      })
    ).map((u) => u.email);

    expect(emails).toContain(abattoirUser.email);
  });

  test('ne filtre pas quand aucun stade n est demandé', async () => {
    const user = genUser({
      roles: ['NationalObserver'],
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });

    await userRepository.insert(user);

    const emails = (
      await userRepository.findMany({ stages: [], disabled: null })
    ).map((u) => u.email);

    expect(emails).toContain(user.email);
  });
});
