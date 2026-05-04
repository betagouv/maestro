import SyncContactError from 'maestro-shared/errors/syncContactError';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import { userRepository } from '../repositories/userRepository';
import { mailService } from './mailService';

const catchSyncError = (err: unknown) => {
  if (err instanceof SyncContactError) {
    console.error('[userService]', err.message);
    return;
  }
  throw err;
};

const insert = async (
  user: Omit<UserRefined, 'id' | 'loggedSecrets'>
): Promise<void> => {
  await userRepository.insert(user);
  await mailService.createContact(user).catch(catchSyncError);
};

const update = async (
  partialUser: Partial<Omit<UserRefined, 'id' | 'loggedSecrets'>>,
  id: UserRefined['id']
): Promise<void> => {
  const existing = await userRepository.findUnique(id);
  if (!existing) {
    return;
  }

  await userRepository.update(partialUser, id);

  if (partialUser.disabled === true) {
    await mailService.deleteContact(existing.email).catch(catchSyncError);
    return;
  }

  const updated = { ...existing, ...partialUser };

  if (partialUser.email && partialUser.email !== existing.email) {
    await mailService.deleteContact(existing.email).catch(catchSyncError);
    await mailService.createContact(updated).catch(catchSyncError);
    return;
  }

  if (
    !partialUser.email &&
    !partialUser.programmingPlanKinds &&
    !partialUser.name
  ) {
    return;
  }

  await mailService.updateContact(updated).catch(catchSyncError);
};

export const userService = {
  insert,
  update
};
