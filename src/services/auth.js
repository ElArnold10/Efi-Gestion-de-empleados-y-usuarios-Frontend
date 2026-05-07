import api from './api';

export const authService = {
  // Login
  login: async (correo, contraseña) => {
    const response = await api.post('/auth/login', { correo, contraseña });
    const { token, user } = response.data.data;
    
    // Guardar en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  // Obtener perfil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Cambiar contraseña
  changePassword: async (contraseña_actual, contraseña_nueva) => {
    const response = await api.put('/auth/change-password', { 
      contraseña_actual, 
      contraseña_nueva 
    });
    return response.data;
  },

  // Refrescar token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    const { token, user } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignorar error en logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual del localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Verificar rol
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.rol === role;
  }
};
