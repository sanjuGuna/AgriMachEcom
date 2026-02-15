import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  getMe: () => api.get('/api/users/me'),
};

// Machine APIs
export const machineAPI = {
  getAll: (params?: { category?: string; minPrice?: number; maxPrice?: number }) =>
    api.get('/api/machines', { params }),
  getById: (id: string) => api.get(`/api/machines/${id}`),
  create: (formData: FormData) =>
    api.post('/api/machines', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, formData: FormData) =>
    api.put(`/api/machines/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/api/machines/${id}`),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/users/me'),
  addAddress: (data: any) => api.post('/api/users/addresses', data),
};

// Order APIs (Admin)
export const orderAPI = {
  getAll: () => api.get('/api/orders'),
  getById: (id: string) => api.get(`/api/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/api/orders/${id}/status`, { status }),
};

export default api;
