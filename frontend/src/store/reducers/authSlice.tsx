import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from 'shared/schema/User/AuthUser';

const authUser = JSON.parse(localStorage.getItem('authUser') ?? '{}');

type AuthState = {
  authUser?: AuthUser;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { authUser } as AuthState,
  reducers: {
    signinUser: (state, action: PayloadAction<{ authUser: AuthUser }>) => {
      localStorage.setItem('authUser', JSON.stringify(action.payload.authUser));
      state.authUser = action.payload.authUser;
    },
    signoutUser: (state) => {
      localStorage.removeItem('authUser');
      state.authUser = undefined;
    }
  }
});

export default authSlice;
