import { genUser } from 'maestro-shared/test/userFixtures';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { mailService } from './mailService';
import { userService } from './userService';

vi.mock('../repositories/userRepository', () => ({
  userRepository: { insert: vi.fn() }
}));
vi.mock('../repositories/programmingSubPlanRepository', () => ({
  programmingSubPlanRepository: { findMany: vi.fn(async () => []) }
}));
vi.mock('./mailService', () => ({
  mailService: { createContact: vi.fn(async () => {}), send: vi.fn() }
}));

describe('userService.insert', () => {
  beforeEach(() => {
    vi.mocked(mailService.send).mockClear();
  });

  test('prévient le support quand l’utilisateur créé doit être formé', async () => {
    const {
      id: _id,
      programmingSubPlans: _subPlans,
      ...user
    } = genUser({
      roles: ['Sampler'],
      certified: false
    });

    await userService.insert(user);

    expect(mailService.send).toHaveBeenCalledExactlyOnceWith({
      templateName: 'GenericTemplate',
      recipients: ['contact@maestro.beta.gouv.fr'],
      params: {
        object: '[Support] Nouvel utilisateur à former',
        content:
          'Un nouvel utilisateur doit être formé avant de pouvoir accéder à Maestro : http://localhost:3000/utilisateurs'
      }
    });
  });

  test('ne prévient pas le support quand l’utilisateur créé est déjà formé', async () => {
    const {
      id: _id,
      programmingSubPlans: _subPlans,
      ...user
    } = genUser({
      roles: ['RegionalCoordinator'],
      certified: true
    });

    await userService.insert(user);

    expect(mailService.send).not.toHaveBeenCalled();
  });
});
