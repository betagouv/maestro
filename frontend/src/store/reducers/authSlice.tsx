import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthMaybeUnknownUser, AuthUser } from 'shared/schema/User/AuthUser';

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
    signoutUser: (state) => {
      localStorage.removeItem('authUser');
      state.authUser = undefined;
    }
  }
});

export default authSlice;
