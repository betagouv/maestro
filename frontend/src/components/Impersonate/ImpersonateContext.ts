import { createContext, useEffect, useState } from 'react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useAppDispatch } from '../../hooks/useStore';
import { useLazyGetUserQuery } from '../../services/user.service';
import authSlice from '../../store/reducers/authSlice';

export const ImpersonateContext = createContext<{
  impersonateUserId: string | null;
  setImpersonateUserId: (value: string | null) => void;
}>(null as never);

export const useImpersonate = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuthentication();
  const [getUser] = useLazyGetUserQuery();

  const [impersonateUserId, setImpersonateUserId] = useState<null | string>(
    localStorage.getItem('administratorId') && user ? user.id : null
  );

  useEffect(() => {
    let userToLoad: string | null = null;
    if (impersonateUserId) {
      userToLoad = impersonateUserId;
      if (!localStorage.getItem('administratorId')) {
        localStorage.setItem('administratorId', user?.id ?? '');
      }
    } else {
      userToLoad = localStorage.getItem('administratorId');
      localStorage.removeItem('administratorId');
    }

    const updateUser = async (userId: string) => {
      const authUser = await getUser(userId);

      dispatch(
        authSlice.actions.signinUser({
          authUser: {
            user: authUser.data ?? null,
            userEmail: authUser.data?.email ?? ''
          }
        })
      );
    };

    if (userToLoad) {
      updateUser(userToLoad);
    }
  }, [impersonateUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { impersonateUserId, setImpersonateUserId };
};
