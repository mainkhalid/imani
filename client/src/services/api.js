import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  }
};

export const donations = {
  getAll: async () => {
    const response = await api.get('/donations');
    return response.data;
  },
  create: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/donations/${id}`, { status });
    return response.data;
  }
};

export const users = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  toggleStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  }
};

export default api;
