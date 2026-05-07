import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS con credenciales
});

// Interceptor para añadir JWT a las peticiones
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

// Interceptor para manejar errores 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, cerrar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Evitar bucle de redirección si ya estamos en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // No tiene permisos, redirigir a página principal o mostrar error
      console.error('Acceso denegado');
    }
    return Promise.reject(error);
  }
);

export default api;
