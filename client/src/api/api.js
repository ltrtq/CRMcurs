import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Добавляем токен в каждый запрос
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Глобальная обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Произошла ошибка на сервере';
    toast.error(message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;