import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  name?: string;
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string; // For API compatibility
  profilePicture?: string; // For API compatibility
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Coba ambil data dari localStorage saat aplikasi mulai (Persist Session)
// Perhatian: Di Next.js (Server Component), localStorage tidak ada.
// Kita handle null check sederhana dulu.
const loadAuthFromStorage = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Error loading auth from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Aksi saat Login Berhasil
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Simpan ke localStorage agar tidak hilang saat refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    // Aksi saat Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
