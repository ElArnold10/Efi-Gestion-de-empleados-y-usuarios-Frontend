import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configurar axios para incluir el token en todas las peticiones
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos de timeout
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

// Manejar errores de autenticación y abortos
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar específicamente errores de aborto
    if (error.code === 'ECONNABORTED' || error.message.includes('Request aborted')) {
      console.warn('Petición abortada o timeout:', error.message);
      return Promise.reject({
        ...error,
        isAborted: true,
        userMessage: 'La petición tardó demasiado tiempo. Por favor, intenta nuevamente.'
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de solicitudes de empleo
export const getEmployeeRequests = async (params = {}) => {
  const response = await api.get('/employee-requests', { params });
  return response.data;
};

export const getEmployeeRequestById = async (id) => {
  const response = await api.get(`/employee-requests/${id}`);
  return response.data;
};

export const approveEmployeeRequest = async (id, data, retryCount = 0) => {
  try {
    const response = await api.put(`/employee-requests/${id}/approve`, data);
    return response.data;
  } catch (error) {
    // Si es un error de timeout/aborto y tenemos menos de 2 reintentos, intentar nuevamente
    if ((error.isAborted || error.code === 'ECONNABORTED' || error.message.includes('Request aborted')) && retryCount < 2) {
      console.warn(`Reintentando aprobación (intento ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
      return approveEmployeeRequest(id, data, retryCount + 1);
    }
    throw error; // Si no, lanzar el error original
  }
};

export const rejectEmployeeRequest = async (id, data, retryCount = 0) => {
  try {
    const response = await api.put(`/employee-requests/${id}/reject`, data);
    return response.data;
  } catch (error) {
    // Si es un error de timeout/aborto y tenemos menos de 2 reintentos, intentar nuevamente
    if ((error.isAborted || error.code === 'ECONNABORTED' || error.message.includes('Request aborted')) && retryCount < 2) {
      console.warn(`Reintentando rechazo (intento ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
      return rejectEmployeeRequest(id, data, retryCount + 1);
    }
    throw error; // Si no, lanzar el error original
  }
};

export const getMyEmployeeRequests = async () => {
  const response = await api.get('/employee-requests/my');
  return response.data;
};

export default api;
