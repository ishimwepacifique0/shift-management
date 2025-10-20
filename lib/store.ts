import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../feature/auth/authSlice';
import staffReducer from '../feature/staff/staffSlice';
import clientReducer from '../feature/clients/clientSlice';
import shiftReducer from '../feature/shifts/shiftSlice';
import userReducer from '../feature/users/userSlice';
import careServiceReducer from '../feature/careServices/careServiceSlice';
import serviceTypeReducer from '../feature/serviceTypes/serviceTypeSlice';
import priceBookReducer from '../feature/priceBooks/priceBookSlice';
import shiftTypeReducer from '../feature/shiftTypes/shiftTypeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    staff: staffReducer,
    clients: clientReducer,
    shifts: shiftReducer,
    users: userReducer,
    careServices: careServiceReducer,
    serviceTypes: serviceTypeReducer,
    priceBooks: priceBookReducer,
    shiftTypes: shiftTypeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;