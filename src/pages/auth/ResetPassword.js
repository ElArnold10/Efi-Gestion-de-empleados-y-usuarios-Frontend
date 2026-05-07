import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Por favor ingresa el token de recuperación');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token: token,
        nueva_contraseña: newPassword
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('Contraseña restablecida exitosamente');
      } else {
        toast.error(response.data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error en reset password:', error);
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña. Inténtalo de nuevo.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Contraseña Restablecida
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Tu contraseña ha sido actualizada exitosamente.
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-green-800">¿Qué sigue?</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa el token que recibiste y tu nueva contraseña
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                Token de Recuperación
              </label>
              <div className="mt-1">
                <input
                  id="token"
                  name="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Pega el token aquí"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                El token fue enviado a tu email por el administrador
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Repite tu nueva contraseña"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 block"
            >
              ¿No tienes un token? Solicita uno nuevo
            </Link>
            <Link
              to="/login"
              className="font-medium text-gray-600 hover:text-gray-500 block"
            >
              Volver al Inicio de Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
