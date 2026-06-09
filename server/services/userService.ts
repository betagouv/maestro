import SyncContactError from 'maestro-shared/errors/syncContactError';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { userRepository } from '../repositories/userRepository';
import { mailService } from './mailService';

const catchSyncError = (err: unknown) => {
  if (err instanceof SyncContactError) {
    console.error('[userService]', err.message);
    return;
  }
  throw err;
};

const resolveContactListIds = (
  user: UserRefined
): (number | null | undefined)[] => {
  return user.programmingSubPlans.map((sp) => sp.contactListId);
};

const resolveAllContactListIds = async (): Promise<number[]> => {
  const subPlans = await programmingSubPlanRepository.findMany();
  return [
    ...new Set(
      subPlans
        .map((sp) => sp.contactListId)
        .filter((id): id is number => id != null)
    )
  ];
};

const insert = async (
  user: Omit<UserRefined, 'id' | 'loggedSecrets'>
): Promise<void> => {
  await userRepository.insert(user);
  const contactListIds = resolveContactListIds(user as UserRefined);
  await mailService
    .createContact({ ...user, contactListIds })
    .catch(catchSyncError);
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
    const contactListIds = resolveContactListIds(updated as UserRefined);
    await mailService
      .createContact({ ...updated, contactListIds })
      .catch(catchSyncError);
    return;
  }

  if (
    !partialUser.email &&
    !partialUser.programmingSubPlans &&
    !partialUser.name
  ) {
    return;
  }

  const [allContactlistids] = await Promise.all([resolveAllContactListIds()]);
  const contactListIds = resolveContactListIds(updated as UserRefined);
  await mailService
    .updateContact({ ...updated, contactListIds, allContactlistids })
    .catch(catchSyncError);
};

export const userService = {
  insert,
  update
};
