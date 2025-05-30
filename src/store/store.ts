import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import entityReducer from '@/features/entities/entitiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entity: entityReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;