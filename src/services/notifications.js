import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configurar axios para incluir el token en todas las peticiones
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir el token de autenticación
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

// Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de notificaciones
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getAdminNotifications = async (params = {}) => {
  const response = await api.get('/notifications/admin', { params });
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Servicios de solicitudes de empleo
export const getEmployeeRequests = async (params = {}) => {
  const response = await api.get('/employee-requests', { params });
  return response.data;
};

export const getEmployeeRequestById = async (id) => {
  const response = await api.get(`/employee-requests/${id}`);
  return response.data;
};

export const approveEmployeeRequest = async (id, data) => {
  const response = await api.put(`/employee-requests/${id}/approve`, data);
  return response.data;
};

export const rejectEmployeeRequest = async (id, data) => {
  const response = await api.put(`/employee-requests/${id}/reject`, data);
  return response.data;
};

export const getMyEmployeeRequests = async () => {
  const response = await api.get('/employee-requests/my');
  return response.data;
};

export default api;
