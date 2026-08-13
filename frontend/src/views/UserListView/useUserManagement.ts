import {
  canManageUser as canManageUserRule,
  type ManagedUser,
  manageableUserRoles,
  managementScope
} from 'maestro-shared/schema/User/UserManagement';
import { useCallback, useMemo } from 'react';
import { useAuthentication } from '../../hooks/useAuthentication';

export const useUserManagement = () => {
  const { account } = useAuthentication();

  const manageableRoles = useMemo(
    () => (account ? manageableUserRoles(account) : []),
    [account]
  );

  const scope = useMemo(
    () => (account ? managementScope(account) : 'none'),
    [account]
  );

  const canManageUser = useCallback(
    (target: ManagedUser & { id: string }) =>
      account ? canManageUserRule(account, target) : false,
    [account]
  );

  return { manageableRoles, scope, canManageUser };
};
