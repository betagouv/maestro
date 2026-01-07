import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AuthMaybeUnknownUser,
  AuthUser
} from 'maestro-shared/schema/User/AuthUser';
import { UserRole } from 'maestro-shared/schema/User/UserRole';

const authUser = JSON.parse(localStorage.getItem('authUser') ?? '{}');

type AuthState = {
  authUser?: AuthUser;
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
    changeUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.authUser) {
        state.authUser.userRole = action.payload;
        localStorage.setItem('authUser', JSON.stringify(state.authUser));
      }
    },
    signoutUser: (state) => {
      localStorage.removeItem('authUser');
      state.authUser = undefined;
    }
  }
});

export default authSlice;
