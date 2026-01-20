import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AuthMaybeUnknownUser,
  AuthUserTransformed
} from 'maestro-shared/schema/User/AuthUser';

const authUser = JSON.parse(localStorage.getItem('authUser') ?? '{}');

type AuthState = {
  authUser?: AuthUserTransformed;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { authUser } as AuthState,
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
