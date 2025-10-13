import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../feature/auth/authSlice';
import staffReducer from '../feature/staff/staffSlice';
import clientReducer from '../feature/clients/clientSlice';
import shiftReducer from '../feature/shifts/shiftSlice';
import userReducer from '../feature/users/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    staff: staffReducer,
    clients: clientReducer,
    shifts: shiftReducer,
    users: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;