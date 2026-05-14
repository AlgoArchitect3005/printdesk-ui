import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Har request mein automatically JWT token add karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;