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

const resolveContactListIds = async (
  user: UserRefined
): Promise<(number | null | undefined)[]> => {
  if (!user.programmingSubPlanIds.length) return [];
  const subPlans = await programmingSubPlanRepository.findManyByIds(
    user.programmingSubPlanIds
  );
  return subPlans.map((sp) => sp.contactListId);
};

const resolveAllContactListIds = async (): Promise<number[]> => {
  const subPlans = await programmingSubPlanRepository.findAll();
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
  const contactListIds = await resolveContactListIds(user as UserRefined);
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
    const contactListIds = await resolveContactListIds(updated);
    await mailService
      .createContact({ ...updated, contactListIds })
      .catch(catchSyncError);
    return;
  }

  if (
    !partialUser.email &&
    !partialUser.programmingSubPlanIds &&
    !partialUser.name
  ) {
    return;
  }

  const [contactListIds, allContactlistids] = await Promise.all([
    resolveContactListIds(updated),
    resolveAllContactListIds()
  ]);
  await mailService
    .updateContact({ ...updated, contactListIds, allContactlistids })
    .catch(catchSyncError);
};

export const userService = {
  insert,
  update
};
