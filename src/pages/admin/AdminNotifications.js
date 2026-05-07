import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  UserCheck,
  UserX,
  Eye,
  Briefcase
} from 'lucide-react';
import * as notificationService from '../../services/notifications';
import * as employeeRequestService from '../../services/employeeRequests';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Cargar notificaciones
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAdminNotifications();
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setStats({
          total: response.data.notifications.length,
          pending: response.data.pending_count || 0,
          approved: response.data.approved_count || 0,
          rejected: response.data.rejected_count || 0
        });
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'unread' && !notification.leida) ||
      (filterStatus === 'read' && notification.leida);

    return matchesSearch && matchesStatus;
  });

  // Marcar como leída
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  // Eliminar notificación
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  // Ver detalles de solicitud
  const handleViewRequest = (notification) => {
    if (notification.tipo_referencia === 'employee_request' && notification.id_referencia) {
      navigate(`/admin/employee-requests/${notification.id_referencia}`);
    }
  };

  // Obtener icono según tipo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'employment_request':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'employment_approved':
        return <UserCheck className="w-5 h-5 text-green-600" />;
      case 'employment_rejected':
        return <UserX className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  // Obtener color de fondo según tipo
  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'employment_request':
        return 'bg-blue-50 border-blue-200';
      case 'employment_approved':
        return 'bg-green-50 border-green-200';
      case 'employment_rejected':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones Administrativas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona las solicitudes de empleo y notificaciones del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Aprobadas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rechazadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="unread">No leídas</option>
            <option value="read">Leídas</option>
          </select>

          {/* Actions */}
          {stats.pending > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar todas como leídas</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.leida ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${getNotificationBgColor(notification.tipo)}`}>
                    {getNotificationIcon(notification.tipo)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.leida ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.titulo}
                          {!notification.leida && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Nueva
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.mensaje}</p>
                        {notification.usuario && (
                          <p className="text-xs text-gray-500 mt-1">
                            Solicitante: {notification.usuario.nombre} ({notification.usuario.correo})
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.tipo_referencia === 'employee_request' && (
                          <button
                            onClick={() => handleViewRequest(notification)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver solicitud"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {!notification.leida && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Marcar como leída"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' 
                ? 'No se encontraron notificaciones' 
                : 'No tienes notificaciones'
              }
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Las notificaciones aparecerán aquí cuando los usuarios se registren'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
