import { Brand } from 'maestro-shared/constants';
import SyncContactError from 'maestro-shared/errors/syncContactError';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { subPlansForStages } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { userRepository } from '../repositories/userRepository';
import config from '../utils/config';
import { mailService } from './mailService';

const catchSyncError = (err: unknown) => {
  if (err instanceof SyncContactError) {
    console.error('[userService]', err.message);
    return;
  }
  throw err;
};

type UserToPersist = Omit<
  UserRefined,
  'id' | 'loggedSecrets' | 'programmingSubPlans'
>;

const resolveContactListIds = async (
  user: Pick<UserRefined, 'stages'>
): Promise<(number | null | undefined)[]> => {
  const subPlans = await programmingSubPlanRepository.findMany();
  return subPlansForStages(subPlans, user.stages).map((sp) => sp.contactListId);
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

const insert = async (user: UserToPersist): Promise<void> => {
  await userRepository.insert(user);
  const contactListIds = await resolveContactListIds(user);
  await mailService
    .createContact({ ...user, contactListIds })
    .catch(catchSyncError);

  if (!user.certified) {
    await mailService.send({
      templateName: 'GenericTemplate',
      recipients: [config.mail.from],
      params: {
        object: '[Support] Nouvel utilisateur à former',
        content: `Un nouvel utilisateur doit être formé avant de pouvoir accéder à ${Brand} : ${config.application.host}${AppRouteLinks.UsersRoute.link()}`
      }
    });
  }
};

const update = async (
  partialUser: Partial<UserToPersist>,
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

  if (!partialUser.email && !partialUser.stages && !partialUser.name) {
    return;
  }

  const [allContactlistids, contactListIds] = await Promise.all([
    resolveAllContactListIds(),
    resolveContactListIds(updated)
  ]);
  await mailService
    .updateContact({ ...updated, contactListIds, allContactlistids })
    .catch(catchSyncError);
};

export const userService = {
  insert,
  update
};
