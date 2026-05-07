import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleGuard = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (requiredRole && user?.rol !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-lg text-gray-600 mb-8">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
