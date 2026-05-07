import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Save,
  AlertTriangle
} from 'lucide-react';
import * as employeeRequestService from '../../services/employeeRequests';

const EmployeeRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [formData, setFormData] = useState({
    posicion: '',
    motivo_rechazo: ''
  });

  // Cargar solicitud
  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await employeeRequestService.getEmployeeRequestById(id);
      
      if (response.success) {
        setRequest(response.data.request);
        setFormData(prev => ({
          ...prev,
          posicion: response.data.request.posicion_deseada
        }));
      }
    } catch (error) {
      console.error('Error cargando solicitud:', error);
      setError('Error al cargar la solicitud de empleo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  // Aprobar solicitud
  const handleApprove = async () => {
    if (!formData.posicion.trim()) {
      setError('Debe especificar la posición para el empleado');
      return;
    }

    try {
      setProcessing(true);
      setRetrying(false);
      
      // Escuchar mensajes de reintento desde la consola
      const originalLog = console.warn;
      console.warn = (...args) => {
        if (args[0] && args[0].includes('Reintentando')) {
          setRetrying(true);
        }
        originalLog(...args);
      };
      
      const response = await employeeRequestService.approveEmployeeRequest(id, {
        posicion: formData.posicion
      });
      
      // Restaurar console.warn original
      console.warn = originalLog;

      if (response.success) {
        // Actualizar estado local
        setRequest(prev => ({
          ...prev,
          estado: 'aprobada',
          fecha_revision: new Date().toISOString()
        }));
        setError('');
      }
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      
      // Manejar específicamente errores de aborto/timeout
      if (error.isAborted || error.code === 'ECONNABORTED' || error.message.includes('Request aborted')) {
        setError('La petición tardó demasiado tiempo. Por favor, verifica tu conexión e intenta nuevamente.');
      } else if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        setError('No tienes permisos para realizar esta acción.');
      } else if (error.response?.status === 404) {
        setError('La solicitud ya no existe o fue eliminada.');
      } else {
        setError('Error al aprobar la solicitud. Por favor, intenta nuevamente.');
      }
    } finally {
      setProcessing(false);
      setRetrying(false);
    }
  };

  // Rechazar solicitud
  const handleReject = async () => {
    if (!formData.motivo_rechazo.trim()) {
      setError('Debe especificar un motivo de rechazo');
      return;
    }

    try {
      setProcessing(true);
      setRetrying(false);
      
      // Escuchar mensajes de reintento desde la consola
      const originalLog = console.warn;
      console.warn = (...args) => {
        if (args[0] && args[0].includes('Reintentando')) {
          setRetrying(true);
        }
        originalLog(...args);
      };
      
      const response = await employeeRequestService.rejectEmployeeRequest(id, {
        motivo_rechazo: formData.motivo_rechazo
      });
      
      // Restaurar console.warn original
      console.warn = originalLog;

      if (response.success) {
        // Actualizar estado local
        setRequest(prev => ({
          ...prev,
          estado: 'rechazada',
          motivo_rechazo: formData.motivo_rechazo,
          fecha_revision: new Date().toISOString()
        }));
        setError('');
      }
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      
      // Manejar específicamente errores de aborto/timeout
      if (error.isAborted || error.code === 'ECONNABORTED' || error.message.includes('Request aborted')) {
        setError('La petición tardó demasiado tiempo. Por favor, verifica tu conexión e intenta nuevamente.');
      } else if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        setError('No tienes permisos para realizar esta acción.');
      } else if (error.response?.status === 404) {
        setError('La solicitud ya no existe o fue eliminada.');
      } else {
        setError('Error al rechazar la solicitud. Por favor, intenta nuevamente.');
      }
    } finally {
      setProcessing(false);
      setRetrying(false);
    }
  };

  // Obtener color según estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-amber-100 text-amber-800';
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono según estado
  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'aprobada':
        return <CheckCircle className="w-4 h-4" />;
      case 'rechazada':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Solicitud no encontrada</h3>
          <p className="text-gray-500 mb-4">La solicitud que buscas no existe o fue eliminada.</p>
          <button
            onClick={() => navigate('/admin/notifications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a notificaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/notifications')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalle de Solicitud de Empleo</h1>
            <p className="mt-1 text-sm text-gray-500">
              Revisa y procesa la solicitud de empleo
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.estado)}`}>
          {getStatusIcon(request.estado)}
          <span className="ml-1 capitalize">{request.estado}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Solicitante */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información del Solicitante
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <p className="text-gray-900">{request.usuario?.nombre}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{request.usuario?.correo}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Solicitud</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posición Deseada</label>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{request.posicion_deseada}</p>
                </div>
              </div>
            </div>
            
            {request.mensaje && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje del Solicitante</label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{request.mensaje}</p>
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          {request.estado === 'pendiente' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Procesar Solicitud</h2>
              
              <div className="space-y-4">
                {/* Aprobación */}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium text-green-900 mb-3">Aprobar Solicitud</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posición Oficial *
                      </label>
                      <input
                        type="text"
                        value={formData.posicion}
                        onChange={(e) => setFormData(prev => ({ ...prev, posicion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: Desarrollador Frontend"
                      />
                    </div>
                    
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{processing ? (retrying ? 'Reintentando...' : 'Procesando...') : 'Aprobar Solicitud'}</span>
                    </button>
                  </div>
                </div>

                {/* Rechazo */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium text-red-900 mb-3">Rechazar Solicitud</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de Rechazo *
                      </label>
                      <textarea
                        value={formData.motivo_rechazo}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivo_rechazo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={3}
                        placeholder="Explica el motivo por el cual se rechaza la solicitud..."
                      />
                    </div>
                    
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{processing ? (retrying ? 'Reintentando...' : 'Procesando...') : 'Rechazar Solicitud'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información de Procesamiento */}
          {request.estado !== 'pendiente' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Procesamiento</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Final</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.estado)}`}>
                    {getStatusIcon(request.estado)}
                    <span className="ml-1 capitalize">{request.estado}</span>
                  </div>
                </div>
                
                {request.fecha_revision && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Revisión</label>
                    <p className="text-gray-900">
                      {new Date(request.fecha_revision).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {request.revisor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revisado por</label>
                    <p className="text-gray-900">{request.revisor.nombre}</p>
                  </div>
                )}
                
                {request.motivo_rechazo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Rechazo</label>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800">{request.motivo_rechazo}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Resumen Rápido */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ID de Solicitud</span>
                <span className="text-sm font-medium">#{request.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <span className={`text-sm font-medium capitalize ${request.estado === 'pendiente' ? 'text-amber-600' : request.estado === 'aprobada' ? 'text-green-600' : 'text-red-600'}`}>
                  {request.estado}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Posición</span>
                <span className="text-sm font-medium">{request.posicion_deseada}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha</span>
                <span className="text-sm font-medium">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          {request.estado === 'pendiente' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, posicion: request.posicion_deseada }));
                    handleApprove();
                  }}
                  disabled={processing}
                  className="w-full px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 text-sm font-medium"
                >
                  Aprobar con posición sugerida
                </button>
                
                <button
                  onClick={() => navigate('/admin/notifications')}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Volver a notificaciones
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeRequestDetail;
