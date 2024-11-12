import { configureStore } from '@reduxjs/toolkit';
import { CurriedGetDefaultMiddleware } from '@reduxjs/toolkit/dist/getDefaultMiddleware';
import { api } from 'src/services/api.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import programmingPlanSlice from 'src/store/reducers/programmingPlanSlice';
import samplesSlice from 'src/store/reducers/samplesSlice';
import authSlice from './reducers/authSlice';

export const applicationReducer = {
  [authSlice.name]: authSlice.reducer,
  [prescriptionsSlice.name]: prescriptionsSlice.reducer,
  [samplesSlice.name]: samplesSlice.reducer,
  [programmingPlanSlice.name]: programmingPlanSlice.reducer,
  [api.reducerPath]: api.reducer,
};

export const applicationMiddleware = (
  getDefaultMiddleware: CurriedGetDefaultMiddleware
) =>
  getDefaultMiddleware({
    serializableCheck: false,
  }).concat(api.middleware);

export const store = configureStore({
  reducer: applicationReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
