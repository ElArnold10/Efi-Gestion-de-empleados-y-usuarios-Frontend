import React, { useState, useEffect, useMemo } from 'react';
import { useScheduleRequests } from '../../contexts/ScheduleRequestsContext';
import { useSchedules } from '../../contexts/SchedulesContext';
import RoleGuard from '../../components/auth/RoleGuard';
import './ScheduleRequestsList.css';

const ScheduleRequestsList = () => {
  const { 
    scheduleRequests, 
    loading, 
    error, 
    fetchScheduleRequests, 
    updateScheduleRequest 
  } = useScheduleRequests();
  const { fetchSchedules } = useSchedules();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [requestToAction, setRequestToAction] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comentarios, setComentarios] = useState('');

  // Cargar solicitudes al montar
  useEffect(() => {
    fetchScheduleRequests();
  }, [fetchScheduleRequests]);

  // Filtrar solicitudes
  const filteredRequests = useMemo(() => {
    return scheduleRequests.filter(request => {
      const employeeName = request.empleado_solicitante?.usuario?.nombre || '';
      const employeeEmail = request.empleado_solicitante?.usuario?.correo || '';
      const date = request.fecha_solicitada || '';
      
      // Búsqueda
      const matchesSearch = searchTerm === '' || 
        employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        date.includes(searchTerm);

      // Filtro por estado
      const matchesStatus = filterStatus === 'all' || 
        request.estado === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [scheduleRequests, searchTerm, filterStatus]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = scheduleRequests.length;
    const pending = scheduleRequests.filter(req => req.estado === 'pendiente').length;
    const approved = scheduleRequests.filter(req => req.estado === 'aprobada').length;
    const rejected = scheduleRequests.filter(req => req.estado === 'rechazada').length;

    return { total, pending, approved, rejected };
  }, [scheduleRequests]);

  const handleApprove = (request) => {
    setRequestToAction(request);
    setActionType('approve');
    setComentarios('');
    setShowActionModal(true);
  };

  const handleReject = (request) => {
    setRequestToAction(request);
    setActionType('reject');
    setComentarios('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (requestToAction) {
      try {
        const action = actionType === 'approve' ? 'approve' : 'reject';
        await updateScheduleRequest(requestToAction.id, action, comentarios);
        
        // Si se aprobó la solicitud, actualizar los horarios
        if (action === 'approve') {
          await fetchSchedules();
        }
        
        setShowActionModal(false);
        setRequestToAction(null);
        setActionType('');
        setComentarios('');
      } catch (error) {
        console.error('Error al procesar solicitud:', error);
      }
    }
  };

  const cancelAction = () => {
    setShowActionModal(false);
    setRequestToAction(null);
    setActionType('');
    setComentarios('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'pending';
      case 'aprobada':
        return 'approved';
      case 'rechazada':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobada':
        return 'Aprobada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return status;
    }
  };
  if (loading && scheduleRequests.length === 0) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="schedule-requests-list">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Solicitudes de Cambio</h1>
            <p className="page-subtitle">Revisa y gestiona las solicitudes de cambio de horario</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <span>📋</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.total}</p>
              <p className="stat-label">Total Solicitudes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <span>⏳</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.pending}</p>
              <p className="stat-label">Pendientes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">
              <span>✅</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.approved}</p>
              <p className="stat-label">Aprobadas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected">
              <span>❌</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.rejected}</p>
              <p className="stat-label">Rechazadas</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group">
              <label className="filter-label">Buscar</label>
              <div className="search-input">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar solicitudes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-field"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Requests Table */}
        <div className="requests-table">
          {filteredRequests.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Fecha Solicitada</th>
                    <th>Horario Actual</th>
                    <th>Nuevo Horario</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {request.empleado_solicitante?.usuario?.nombre?.charAt(0).toUpperCase() || 'E'}
                          </div>
                          <div>
                            <div className="employee-name">
                              {request.empleado_solicitante?.usuario?.nombre || 'Sin nombre'}
                            </div>
                            <div className="employee-email">
                              {request.empleado_solicitante?.usuario?.correo || 'Sin correo'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="date">
                          {request.fecha_solicitada 
                            ? new Date(request.fecha_solicitada).toLocaleDateString()
                            : 'Sin fecha'
                          }
                        </span>
                      </td>
                      <td>
                        <div className="time-range current">
                          <span className="time-label">Actual:</span>
                          <div className="time-values">
                            {request.hora_actual_inicio && request.hora_actual_fin
                              ? `${request.hora_actual_inicio} - ${request.hora_actual_fin}`
                              : 'N/A'
                            }
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="time-range new">
                          <span className="time-label">Nuevo:</span>
                          <div className="time-values">
                            {request.nueva_hora_inicio && request.nueva_hora_fin
                              ? `${request.nueva_hora_inicio} - ${request.nueva_hora_fin}`
                              : 'N/A'
                            }
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="motivo">
                          {request.motivo ? (
                            <span className="motivo-text" title={request.motivo}>
                              {request.motivo.length > 50 
                                ? `${request.motivo.substring(0, 50)}...`
                                : request.motivo
                              }
                            </span>
                          ) : (
                            <span className="no-motivo">Sin motivo</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status ${getStatusColor(request.estado)}`}>
                          {getStatusText(request.estado)}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          {request.estado === 'pendiente' && (
                            <>
                              <button
                                onClick={() => handleApprove(request)}
                                className="btn btn-sm btn-success"
                              >
                                ✅ Aprobar
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="btn btn-sm btn-danger"
                              >
                                ❌ Rechazar
                              </button>
                            </>
                          )}
                          {request.estado !== 'pendiente' && (
                            <span className="no-actions">
                              {request.estado === 'aprobada' ? '✅ Aprobada' : '❌ Rechazada'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>
                {searchTerm || filterStatus !== 'all'
                  ? 'No se encontraron solicitudes' 
                  : 'No hay solicitudes'
                }
              </h3>
              <p>
                {searchTerm || filterStatus !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Las solicitudes aparecerán aquí cuando los empleados las creen'
                }
              </p>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {showActionModal && requestToAction && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>
                  {actionType === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                </h3>
              </div>
              <div className="modal-body">
                <p>
                  {actionType === 'approve' 
                    ? '¿Estás seguro de que deseas aprobar esta solicitud?' 
                    : '¿Estás seguro de que deseas rechazar esta solicitud?'
                  }
                </p>
                <div className="modal-request-info">
                  <p><strong>Empleado:</strong> {requestToAction.empleado_solicitante?.usuario?.nombre}</p>
                  <p><strong>Fecha:</strong> {new Date(requestToAction.fecha_solicitada).toLocaleDateString()}</p>
                  <p><strong>Cambio:</strong> {requestToAction.hora_actual_inicio}-{requestToAction.hora_actual_fin} → {requestToAction.nueva_hora_inicio}-{requestToAction.nueva_hora_fin}</p>
                  {requestToAction.motivo && (
                    <p><strong>Motivo:</strong> {requestToAction.motivo}</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Comentarios {actionType === 'reject' && '(requerido)'}
                  </label>
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    className="form-textarea"
                    placeholder={actionType === 'reject' 
                      ? 'Explica el motivo del rechazo...' 
                      : 'Añade comentarios opcionales...'
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={cancelAction}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAction}
                  className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  disabled={actionType === 'reject' && !comentarios.trim()}
                >
                  {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default ScheduleRequestsList;
