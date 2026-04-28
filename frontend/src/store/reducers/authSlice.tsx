import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  AuthMaybeUnknownUser,
  type AuthUserRefined
} from 'maestro-shared/schema/User/AuthUser';

const authUser = {
  laboratoryId: null,
  ...AuthMaybeUnknownUser.safeParse(
    JSON.parse(localStorage.getItem('authUser') ?? '{}')
  ).data
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
