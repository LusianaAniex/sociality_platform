import axios from 'axios';

// Ganti URL ini dengan URL backend kamu nanti
// Untuk development lokal biasanya http://localhost:5000 atau sesuai backend
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://social-media-be-400174736012.asia-southeast2.run.app/api-swagger/';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: "Satpam" yang mengecek setiap request keluar
axiosInstance.interceptors.request.use(
  (config) => {
    // Ambil token dari Local Storage (kita akan simpan di sana nanti)
    const token = localStorage.getItem('token');

    // Jika ada token, tempelkan ke Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
