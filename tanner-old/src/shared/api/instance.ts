import axios from 'axios';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export const axiosInstance = axios.create({
  method: 'post',
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});
