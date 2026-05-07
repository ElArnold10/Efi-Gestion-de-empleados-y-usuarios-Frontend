import React from 'react';
import RoleGuard from '../../components/auth/RoleGuard';

const EmployeeForm = () => {
  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulario de Empleado</h1>
          <p className="text-gray-600">Crea o edita información de empleados</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Esta página está en construcción</p>
        </div>
      </div>
    </RoleGuard>
  );
};

export default EmployeeForm;
