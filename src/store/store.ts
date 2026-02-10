import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Nanti kita tambah feedReducer, postReducer, dll di sini
  },
});

// Tipe data untuk TypeScript agar coding lebih aman
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;