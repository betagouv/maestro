import { configureStore } from '@reduxjs/toolkit';
import { api } from 'src/services/api.service';
import sampleSlice from 'src/store/reducers/sampleSlice';
import authSlice from './reducers/authSlice';

export const applicationReducer = {
  [authSlice.name]: authSlice.reducer,
  [sampleSlice.name]: sampleSlice.reducer,
  [api.reducerPath]: api.reducer,
};

export const store = configureStore({
  reducer: applicationReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
