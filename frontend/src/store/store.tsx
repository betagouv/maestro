import type { Middleware } from '@reduxjs/toolkit';
import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import { api, tagTypes } from 'src/services/api.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import samplesSlice from 'src/store/reducers/samplesSlice';
import authSlice from './reducers/authSlice';

const unauthorizedMiddleware: Middleware = () => (next) => (action) => {
  if (
    isRejectedWithValue(action) &&
    (action.payload as { status?: number })?.status === 401
  ) {
    localStorage.removeItem('authUser');
    window.location.replace('/');
  }
  return next(action);
};

export const applicationReducer = {
  [authSlice.name]: authSlice.reducer,
  [prescriptionsSlice.name]: prescriptionsSlice.reducer,
  [samplesSlice.name]: samplesSlice.reducer,
  [api.reducerPath]: api.reducer
};

export const store = configureStore({
  reducer: applicationReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(api.middleware, unauthorizedMiddleware)
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const appLogout = () => async (dispatch: AppDispatch) => {
  console.log('logout');
  dispatch(authSlice.actions.signoutUser());
  dispatch(api.util.invalidateTags([...tagTypes]));
  dispatch(prescriptionsSlice.actions.reset());
};
