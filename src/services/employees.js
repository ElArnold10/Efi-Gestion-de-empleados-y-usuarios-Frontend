import api from './api';

export const employeeService = {
  // Obtener todos los empleados (admin)
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data.data.employees;
  },

  // Crear empleado (admin)
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data.data.employee;
  },

  // Actualizar empleado (admin)
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data.data.employee;
  },

  // Eliminar empleado (admin)
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};
