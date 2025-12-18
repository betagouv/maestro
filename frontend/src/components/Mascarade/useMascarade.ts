import { COOKIE_MAESTRO_MASCARADE } from 'maestro-shared/constants';
import { useContext, useState } from 'react';
import { useAppDispatch } from '../../hooks/useStore';
import { api } from '../../services/api.service';
import { ApiClientContext } from '../../services/apiClient';
import authSlice from '../../store/reducers/authSlice';

const cookieExists = (cookieName: string): boolean =>
  document.cookie
    .split(';')
    .some((item) => item.trim().startsWith(cookieName + '='));

export const useMascarade = () => {
  const apiClient = useContext(ApiClientContext);
  const [getUser] = apiClient.useLazyGetUserQuery();

  const dispatch = useAppDispatch();

  const [mascaradeStop] = apiClient.useMascaradeStopMutation();
  const [mascaradeStart] = apiClient.useMascaradeStartMutation();

  const [mascaradeEnabled] = useState<boolean>(
    cookieExists(COOKIE_MAESTRO_MASCARADE)
  );

  const refreshCurrentUser = async (newUserId: string | undefined) => {
    if (newUserId) {
      dispatch(api.util.resetApiState());
      const authUser = await getUser(newUserId).unwrap();
      dispatch(
        authSlice.actions.signinUser({
          authUser: {
            user: authUser ?? null,
            userRole: authUser?.roles?.[0] ?? null
          }
        })
      );
      window.location.reload();
    }
  };

  const disableMascarade = async () => {
    const { data } = await mascaradeStop(undefined);
    await refreshCurrentUser(data?.userId);
  };

  const setMascaradeUserId = async (userId: string) => {
    await mascaradeStart({ userId });
    await refreshCurrentUser(userId);
  };

  return { mascaradeEnabled, setMascaradeUserId, disableMascarade };
};
