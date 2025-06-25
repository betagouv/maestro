import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useAppDispatch } from '../../hooks/useStore';
import { ApiClientContext } from '../../services/apiClient';
import authSlice from '../../store/reducers/authSlice';

export const MascaradeContext = createContext<{
  mascaradeUserId: string | null;
  setMascaradeUserId: (value: string | null) => void;
}>({
  mascaradeUserId: null,
  setMascaradeUserId: () => ({})
});

export const useMascarade = () => {
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);
  const { user } = useAuthentication();
  const [getUser] = apiClient.useLazyGetUserQuery();

  const [mascaradeUserId, setMascaradeUserId] = useState<null | string>(
    localStorage.getItem('administratorId') && user ? user.id : null
  );

  useEffect(() => {
    let userToLoad: string | null = null;
    if (mascaradeUserId) {
      userToLoad = mascaradeUserId;
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
  }, [mascaradeUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { mascaradeUserId, setMascaradeUserId };
};
