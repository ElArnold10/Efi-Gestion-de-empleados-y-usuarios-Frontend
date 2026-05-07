import api from './api';

export const scheduleService = {
  // Obtener todos los horarios (admin)
  getSchedules: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/schedules?${params}`);
    return response.data.data.schedules;
  },

  // Crear horario (admin)
  createSchedule: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data.data.schedule;
  },

  // Actualizar horario (admin)
  updateSchedule: async (id, scheduleData) => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data.data.schedule;
  },

  // Eliminar horario (admin)
  deleteSchedule: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },

  // Obtener mis horarios (empleado)
  getMySchedules: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/my-schedules?${params}`);
    return response.data.data.schedules;
  }
};
