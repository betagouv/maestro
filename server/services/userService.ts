import type { UserRefined } from 'maestro-shared/schema/User/User';
import { userRepository } from '../repositories/userRepository';
import { mailService } from './mailService';

const insert = async (
  user: Omit<UserRefined, 'id' | 'loggedSecrets' | 'name'>
): Promise<void> => {
  await userRepository.insert(user);
  await mailService.createContact({ ...user, name: null });
};

const update = async (
  partialUser: Partial<Omit<UserRefined, 'id' | 'loggedSecrets'>>,
  id: UserRefined['id']
): Promise<void> => {
  await userRepository.update(partialUser, id);

  const existing = await userRepository.findUnique(id);
  if (!existing) {
    return;
  }

  if (partialUser.disabled === true) {
    await mailService.deleteContact(existing.email);
    return;
  }

  if (!partialUser.email && !partialUser.programmingPlanKinds) {
    return;
  }

  await mailService.updateContact(existing);
};

export const userService = {
  insert,
  update
};
