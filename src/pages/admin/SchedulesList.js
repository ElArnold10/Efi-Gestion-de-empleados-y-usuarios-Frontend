import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedules } from '../../contexts/SchedulesContext';
import { useEmployees } from '../../contexts/EmployeesContext';
import RoleGuard from '../../components/auth/RoleGuard';
import './SchedulesList.css';

const SchedulesList = () => {
  const { 
    schedules, 
    loading, 
    error, 
    fetchSchedules, 
    deleteSchedule,
    exportToPDF 
  } = useSchedules();
  const { employees } = useEmployees();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const navigate = useNavigate();

  // Cargar horarios al montar
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Filtrar horarios
  const filteredSchedules = useMemo(() => {
    if (!Array.isArray(schedules)) {
      return [];
    }
    return schedules.filter(schedule => {
      const employeeName = schedule.empleado?.usuario?.nombre || '';
      const employeeEmail = schedule.empleado?.usuario?.correo || '';
      const date = schedule.fecha || '';
      
      // Búsqueda
      const matchesSearch = searchTerm === '' || 
        employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        date.includes(searchTerm);

      // Filtro por empleado
      const matchesEmployee = filterEmployee === 'all' || 
        schedule.id_empleado === parseInt(filterEmployee);

      // Filtro por rango de fechas
      let matchesDateRange = true;
      if (filterDateRange.start && filterDateRange.end) {
        const scheduleDate = new Date(date);
        const startDate = new Date(filterDateRange.start);
        const endDate = new Date(filterDateRange.end);
        matchesDateRange = scheduleDate >= startDate && scheduleDate <= endDate;
      } else if (filterDateRange.start) {
        const scheduleDate = new Date(date);
        const startDate = new Date(filterDateRange.start);
        matchesDateRange = scheduleDate >= startDate;
      } else if (filterDateRange.end) {
        const scheduleDate = new Date(date);
        const endDate = new Date(filterDateRange.end);
        matchesDateRange = scheduleDate <= endDate;
      }

      return matchesSearch && matchesEmployee && matchesDateRange;
    });
  }, [schedules, searchTerm, filterEmployee, filterDateRange]);

  // Estadísticas
  const stats = useMemo(() => {
    if (!Array.isArray(schedules)) {
      return { total: 0, thisWeek: 0, active: 0 };
    }
    const total = schedules.length;
    const thisWeek = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.fecha);
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    }).length;

    return { total, thisWeek };
  }, [schedules]);

  const handleEdit = (schedule) => {
    navigate(`/admin/schedules/${schedule.id}/edit`);
  };

  const handleDelete = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (scheduleToDelete) {
      try {
        await deleteSchedule(scheduleToDelete.id);
        setShowDeleteModal(false);
        setScheduleToDelete(null);
      } catch (error) {
        console.error('Error al eliminar horario:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
  };

  const handleExport = async (filters = {}) => {
    try {
      const exportFilters = {
        ...filters,
        id_empleado: filterEmployee !== 'all' ? filterEmployee : undefined,
        fecha_inicio: filterDateRange.start || undefined,
        fecha_fin: filterDateRange.end || undefined
      };
      
      await exportToPDF(exportFilters, 'Reporte de Horarios');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEmployee('all');
    setFilterDateRange({ start: '', end: '' });
  };
  if (loading || !Array.isArray(schedules)) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando horarios...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="schedules-list">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Gestión de Horarios</h1>
            <p className="page-subtitle">Administra los horarios de los empleados</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowExportModal(true)}
              className="btn btn-secondary"
            >
              <span className="btn-icon">📄</span>
              Exportar PDF
            </button>
            <button 
              onClick={() => navigate('/admin/schedules/new')}
              className="btn btn-primary"
            >
              <span className="btn-icon">+</span>
              Nuevo Horario
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <span>📅</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.total}</p>
              <p className="stat-label">Total Horarios</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon week">
              <span>📆</span>
            </div>
            <div className="stat-content">
              <p className="stat-number">{stats.thisWeek}</p>
              <p className="stat-label">Esta Semana</p>
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
                  placeholder="Buscar horarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-field"
                />
              </div>
            </div>

            {/* Employee Filter */}
            <div className="filter-group">
              <label className="filter-label">Empleado</label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los empleados</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.usuario?.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="filter-group">
              <label className="filter-label">Fecha Inicio</label>
              <input
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Fecha Fin</label>
              <input
                type="date"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary btn-sm">
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Schedules Table */}
        <div className="schedules-table">
          {filteredSchedules.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {schedule.empleado?.usuario?.nombre?.charAt(0).toUpperCase() || 'E'}
                          </div>
                          <div>
                            <div className="employee-name">
                              {schedule.empleado?.usuario?.nombre || 'Sin nombre'}
                            </div>
                            <div className="employee-email">
                              {schedule.empleado?.usuario?.correo || 'Sin correo'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="date">
                          {schedule.fecha 
                            ? new Date(schedule.fecha).toLocaleDateString()
                            : 'Sin fecha'
                          }
                        </span>
                      </td>
                      <td>
                        <div className="time-range">
                          <span className="time-start">
                            {schedule.hora_inicio || 'N/A'}
                          </span>
                          <span className="time-separator">-</span>
                          <span className="time-end">
                            {schedule.hora_fin || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="status active">
                          Activo
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="btn btn-sm btn-secondary"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(schedule)}
                            className="btn btn-sm btn-danger"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>
                {searchTerm || filterEmployee !== 'all' || filterDateRange.start || filterDateRange.end
                  ? 'No se encontraron horarios' 
                  : 'No hay horarios'
                }
              </h3>
              <p>
                {searchTerm || filterEmployee !== 'all' || filterDateRange.start || filterDateRange.end
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Crea tu primer horario usando el botón superior'
                }
              </p>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && scheduleToDelete && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Confirmar Eliminación</h3>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar el horario:</p>
                <div className="modal-schedule-info">
                  <p><strong>Empleado:</strong> {scheduleToDelete.empleado?.usuario?.nombre}</p>
                  <p><strong>Fecha:</strong> {new Date(scheduleToDelete.fecha).toLocaleDateString()}</p>
                  <p><strong>Horario:</strong> {scheduleToDelete.hora_inicio} - {scheduleToDelete.hora_fin}</p>
                </div>
                <p className="modal-warning">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  onClick={cancelDelete}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Exportar a PDF</h3>
              </div>
              <div className="modal-body">
                <p>Selecciona los criterios de exportación:</p>
                <div className="export-options">
                  <label className="export-option">
                    <input
                      type="radio"
                      name="exportType"
                      defaultChecked
                      onChange={() => {}}
                    />
                    <span>Exportar todos los horarios</span>
                  </label>
                  <label className="export-option">
                    <input
                      type="radio"
                      name="exportType"
                      onChange={() => {}}
                    />
                    <span>Exportar con filtros actuales</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleExport()}
                  className="btn btn-primary"
                >
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default SchedulesList;
