import api from './api';

export const scheduleRequestService = {
  // Crear solicitud de cambio de horario (empleado)
  createScheduleRequest: async (requestData) => {
    const response = await api.post('/schedule-requests', requestData);
    return response.data.data.request;
  },

  // Obtener todas las solicitudes (admin)
  getScheduleRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/schedule-requests?${params}`);
    return response.data.data.requests;
  },

  // Obtener mis solicitudes (empleado)
  getMyScheduleRequests: async () => {
    const response = await api.get('/schedule-requests');
    return response.data.data.requests;
  },

  // Aprobar/rechazar solicitud (admin)
  approveOrRejectScheduleRequest: async (id, action, comentarios_revision) => {
    const response = await api.put(`/schedule-requests/${id}`, { action, comentarios_revision });
    return response.data.data.request;
  },

  // Actualizar solicitud (método genérico para compatibilidad)
  updateScheduleRequest: async (id, action, comentarios_revision) => {
    return await scheduleRequestService.approveOrRejectScheduleRequest(id, action, comentarios_revision);
  }
};
