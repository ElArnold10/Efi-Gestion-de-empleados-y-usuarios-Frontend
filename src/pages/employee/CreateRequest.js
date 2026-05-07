import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduleRequests } from '../../contexts/ScheduleRequestsContext';
import { useSchedules } from '../../contexts/SchedulesContext';
import { useAuth } from '../../contexts/AuthContext';
import './CreateRequest.css';

const CreateRequest = () => {
  const { createScheduleRequest } = useScheduleRequests();
  const { mySchedules, fetchMySchedules } = useSchedules();
  const { isEmployee } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fecha_solicitada: '',
    hora_actual_inicio: '',
    hora_actual_fin: '',
    nueva_hora_inicio: '',
    nueva_hora_fin: '',
    motivo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Cargar horarios del empleado al montar
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        // Verificar que el usuario sea empleado
        if (!isEmployee()) {
          setError('Solo los empleados pueden crear solicitudes de cambio de horario.');
          return;
        }
        
        await fetchMySchedules();
      } catch (error) {
        console.error('Error loading schedules:', error);
        setError('Error al cargar tus horarios. Intenta recargar la página.');
      }
    };
    
    loadSchedules();
  }, [isEmployee, fetchMySchedules]);

  // Manejar selección de horario
  const handleScheduleSelect = (scheduleId) => {
    const schedule = mySchedules.find(s => s.id === parseInt(scheduleId));
    if (schedule) {
      setSelectedSchedule(schedule);
      setFormData(prev => ({
        ...prev,
        fecha_solicitada: schedule.fecha,
        hora_actual_inicio: schedule.hora_inicio ? schedule.hora_inicio.substring(0, 5) : '',
        hora_actual_fin: schedule.hora_fin ? schedule.hora_fin.substring(0, 5) : '',
        nueva_hora_inicio: '',
        nueva_hora_fin: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar mensajes
    if (message) setMessage('');
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.fecha_solicitada) {
      errors.push('La fecha solicitada es requerida');
    }
    
    if (!formData.hora_actual_inicio || !formData.hora_actual_fin) {
      errors.push('El horario actual es requerido');
    }
    
    if (!formData.nueva_hora_inicio || !formData.nueva_hora_fin) {
      errors.push('El nuevo horario es requerido');
    }
    
    if (!formData.motivo.trim()) {
      errors.push('El motivo es requerido');
    }
    
    // Validar que las horas sean válidas
    if (formData.hora_actual_inicio >= formData.hora_actual_fin) {
      errors.push('La hora de fin actual debe ser posterior a la hora de inicio');
    }
    
    if (formData.nueva_hora_inicio >= formData.nueva_hora_fin) {
      errors.push('La hora de fin nueva debe ser posterior a la hora de inicio');
    }
    
    // Validar que la fecha no sea pasada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestDate = new Date(formData.fecha_solicitada);
    if (requestDate < today) {
      errors.push('La fecha solicitada no puede ser anterior a hoy');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que el usuario sea empleado
    if (!isEmployee()) {
      setError('Solo los empleados pueden crear solicitudes de cambio de horario.');
      return;
    }
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Formatear las horas para asegurar formato HH:MM
      const formattedData = {
        ...formData,
        hora_actual_inicio: formData.hora_actual_inicio ? formData.hora_actual_inicio.substring(0, 5) : '',
        hora_actual_fin: formData.hora_actual_fin ? formData.hora_actual_fin.substring(0, 5) : '',
        nueva_hora_inicio: formData.nueva_hora_inicio ? formData.nueva_hora_inicio.substring(0, 5) : '',
        nueva_hora_fin: formData.nueva_hora_fin ? formData.nueva_hora_fin.substring(0, 5) : ''
      };
      
      await createScheduleRequest(formattedData);
      setMessage('Solicitud creada exitosamente. Será revisada por el administrador.');
      
      // Limpiar formulario
      setFormData({
        fecha_solicitada: '',
        hora_actual_inicio: '',
        hora_actual_fin: '',
        nueva_hora_inicio: '',
        nueva_hora_fin: '',
        motivo: ''
      });
      setSelectedSchedule(null);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/employee/my-requests');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating schedule request:', error);
      let errorMessage = 'Error al crear la solicitud';
      
      if (error.response?.data?.error === 'EMPLOYEE_NOT_FOUND') {
        errorMessage = 'No se encontró tu registro de empleado. Contacta al administrador.';
      } else if (error.response?.data?.error === 'PENDING_REQUEST_ALREADY_EXISTS') {
        errorMessage = 'Ya tienes una solicitud pendiente para esta fecha.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee/my-requests');
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  return (
    <div className="create-request">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Crear Solicitud</h1>
            <p className="page-subtitle">Solicita un cambio en tu horario</p>
          </div>
        </div>

        {/* Form */}
        <div className="form-container">
          <form onSubmit={handleSubmit} className="request-form">
            {/* Success Message */}
            {message && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span>{message}</span>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-grid">
              {/* Seleccionar Horario Existente */}
              <div className="form-group full-width">
                <label className="form-label">Seleccionar Horario a Cambiar *</label>
                <select
                  value={selectedSchedule ? selectedSchedule.id : ""}
                  onChange={(e) => handleScheduleSelect(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Selecciona un horario --</option>
                  {mySchedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.fecha} - {schedule.hora_inicio} a {schedule.hora_fin}
                    </option>
                  ))}
                </select>
                {mySchedules.length === 0 && (
                  <p className="form-help">No tienes horarios asignados. Contacta al administrador.</p>
                )}
              </div>

              {/* Fecha Solicitada */}
              <div className="form-group full-width">
                <label className="form-label">Fecha del Cambio *</label>
                <input
                  type="date"
                  name="fecha_solicitada"
                  value={formData.fecha_solicitada}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="form-input"
                  required
                />
              </div>

              {/* Horario Actual */}
              <div className="form-section">
                <h3 className="section-title">Horario Actual</h3>
                <div className="time-inputs">
                  <div className="form-group">
                    <label className="form-label">Hora Inicio *</label>
                    <input
                      type="time"
                      name="hora_actual_inicio"
                      value={formData.hora_actual_inicio}
                      onChange={handleChange}
                      className="form-input"
                      readOnly={selectedSchedule !== null}
                      placeholder={selectedSchedule ? 'Seleccionado del horario existente' : 'Ingresa hora actual'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora Fin *</label>
                    <input
                      type="time"
                      name="hora_actual_fin"
                      value={formData.hora_actual_fin}
                      onChange={handleChange}
                      className="form-input"
                      readOnly={selectedSchedule !== null}
                      placeholder={selectedSchedule ? 'Seleccionado del horario existente' : 'Ingresa hora actual'}
                      required
                    />
                  </div>
                </div>
                {selectedSchedule && (
                  <p className="form-help">ℹ️ Horario precargado desde tu selección. Solo puedes modificar el nuevo horario.</p>
                )}
              </div>

              {/* Nuevo Horario */}
              <div className="form-section">
                <h3 className="section-title">Nuevo Horario</h3>
                <div className="time-inputs">
                  <div className="form-group">
                    <label className="form-label">Hora Inicio *</label>
                    <input
                      type="time"
                      name="nueva_hora_inicio"
                      value={formData.nueva_hora_inicio}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora Fin *</label>
                    <input
                      type="time"
                      name="nueva_hora_fin"
                      value={formData.nueva_hora_fin}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Motivo */}
              <div className="form-group full-width">
                <label className="form-label">Motivo del Cambio *</label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Explica por qué necesitas cambiar tu horario..."
                  rows={4}
                  required
                />
                <p className="form-help">
                  Sé específico sobre el motivo de tu solicitud para facilitar su aprobación.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                <span className="btn-icon">❌</span>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📤</span>
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <h3 className="info-title">ℹ️ Información Importante</h3>
          <ul className="info-list">
            <li>Las solicitudes deben enviarse con al menos 24 horas de anticipación</li>
            <li>El administrador revisará tu solicitud y te notificará la respuesta</li>
            <li>Sé específico en el motivo para facilitar la aprobación</li>
            <li>Puedes ver el estado de tus solicitudes en "Mis Solicitudes"</li>
          </ul>
        </div>
      </div>
  );
};

export default CreateRequest;
