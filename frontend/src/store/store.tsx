import { configureStore, ConfigureStoreOptions  } from '@reduxjs/toolkit';
import { api, tagTypes } from 'src/services/api.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import programmingPlanSlice from 'src/store/reducers/programmingPlanSlice';
import samplesSlice from 'src/store/reducers/samplesSlice';
import authSlice from './reducers/authSlice';

export const applicationReducer = {
  [authSlice.name]: authSlice.reducer,
  [prescriptionsSlice.name]: prescriptionsSlice.reducer,
  [samplesSlice.name]: samplesSlice.reducer,
  [programmingPlanSlice.name]: programmingPlanSlice.reducer,
  [api.reducerPath]: api.reducer
};
export const applicationMiddleware = (
  getDefaultMiddleware: Parameters<Required<ConfigureStoreOptions>['middleware']>[0]
) =>
  getDefaultMiddleware({
    serializableCheck: false
  }).concat(api.middleware);

export const store = configureStore({
  reducer: applicationReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(api.middleware)
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const logout = () => async (dispatch: AppDispatch) => {
  console.log('logout');
  dispatch(authSlice.actions.signoutUser());
  dispatch(api.util.invalidateTags(tagTypes));
  dispatch(prescriptionsSlice.actions.reset());
};
