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
    response => response,
    error => {
        if (!error.response) {
            toast.error("Сервер недоступен. Проверьте работу Docker-контейнеров.");
        } else if (error.response.status === 401) {
            toast.error("Сессия истекла. Войдите заново.");
            // Можно добавить редирект на /login
        }
        return Promise.reject(error);
    }
);

export default api;