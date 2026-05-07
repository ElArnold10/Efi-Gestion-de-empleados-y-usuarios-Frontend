import api from './api';

export interface LoginResponse {
  user: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

export const authService = {
  // Login
  login: async (correo: string, contraseña: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { correo, contraseña });
    const { token, user } = response.data.data;
    
    // Guardar en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
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
  hasRole: (role: string) => {
    const user = authService.getCurrentUser();
    return user && user.rol === role;
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
};
