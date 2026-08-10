import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  AuthMaybeUnknownUser,
  type AuthUserRefined
} from 'maestro-shared/schema/User/AuthUser';

const storedAuthUser = () => {
  const stored = JSON.parse(localStorage.getItem('authUser') ?? '{}');

  // Fix temporaire, le temps de la mise en place de account. À supprimer une fois le déploiement digéré.
  if (stored.user && !stored.account) {
    localStorage.removeItem('authUser');
    return undefined;
  }

  const { data: user, error } = AuthMaybeUnknownUser.safeParse(stored);
  if (error) {
    localStorage.removeItem('authUser');
    return undefined;
  }
  return user;
};

const authUser = {
  laboratoryId: null,
  ...storedAuthUser()
};

type AuthState = {
  authUser?: Omit<AuthUserRefined, 'user'> & {
    user: Omit<AuthUserRefined['user'], 'roles'>;
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    authUser:
      'user' in authUser
        ? {
            ...authUser,
            user: {
              laboratoryId: null,
              ...authUser.user
            }
          }
        : authUser
  } as AuthState,
  reducers: {
    signinUser: (
      state,
      action: PayloadAction<{ authUser: AuthMaybeUnknownUser }>
    ) => {
      localStorage.setItem('authUser', JSON.stringify(action.payload.authUser));
      if (action.payload.authUser.user !== null) {
        state.authUser = action.payload.authUser;
      }
    },
    signoutUser: (state) => {
      localStorage.removeItem('authUser');
      state.authUser = undefined;
    }
  }
});

export default authSlice;
