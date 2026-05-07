import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/schedules';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SchedulesContext = createContext();

// Estado inicial
const initialState = {
  schedules: [],
  mySchedules: [],
  loading: false,
  error: null,
  currentSchedule: null
};

// Actions
const SCHEDULE_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  FETCH_MY_START: 'FETCH_MY_START',
  FETCH_MY_SUCCESS: 'FETCH_MY_SUCCESS',
  FETCH_MY_FAILURE: 'FETCH_MY_FAILURE',
  CREATE_START: 'CREATE_START',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  CREATE_FAILURE: 'CREATE_FAILURE',
  UPDATE_START: 'UPDATE_START',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  UPDATE_FAILURE: 'UPDATE_FAILURE',
  DELETE_START: 'DELETE_START',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  DELETE_FAILURE: 'DELETE_FAILURE',
  SET_CURRENT_SCHEDULE: 'SET_CURRENT_SCHEDULE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const scheduleReducer = (state, action) => {
  switch (action.type) {
    case SCHEDULE_ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case SCHEDULE_ACTIONS.FETCH_SUCCESS:
      return { ...state, loading: false, schedules: action.payload, error: null };
    case SCHEDULE_ACTIONS.FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SCHEDULE_ACTIONS.FETCH_MY_START:
      return { ...state, loading: true, error: null };
    case SCHEDULE_ACTIONS.FETCH_MY_SUCCESS:
      return { ...state, loading: false, mySchedules: action.payload, error: null };
    case SCHEDULE_ACTIONS.FETCH_MY_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SCHEDULE_ACTIONS.CREATE_START:
      return { ...state, loading: true, error: null };
    case SCHEDULE_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        schedules: [action.payload, ...state.schedules],
        error: null
      };
    case SCHEDULE_ACTIONS.CREATE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SCHEDULE_ACTIONS.UPDATE_START:
      return { ...state, loading: true, error: null };
    case SCHEDULE_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        schedules: state.schedules.map(schedule =>
          schedule.id === action.payload.id ? action.payload : schedule
        ),
        mySchedules: state.mySchedules.map(schedule =>
          schedule.id === action.payload.id ? action.payload : schedule
        ),
        error: null
      };
    case SCHEDULE_ACTIONS.UPDATE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SCHEDULE_ACTIONS.DELETE_START:
      return { ...state, loading: true, error: null };
    case SCHEDULE_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        schedules: state.schedules.filter(schedule => schedule.id !== action.payload),
        mySchedules: state.mySchedules.filter(schedule => schedule.id !== action.payload),
        error: null
      };
    case SCHEDULE_ACTIONS.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SCHEDULE_ACTIONS.SET_CURRENT_SCHEDULE:
      return { ...state, currentSchedule: action.payload };
    case SCHEDULE_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const SchedulesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  // Obtener todos los horarios (admin)
  const fetchSchedules = async (filters = {}) => {
    try {
      dispatch({ type: SCHEDULE_ACTIONS.FETCH_START });
      const schedules = await scheduleService.getSchedules(filters);
      dispatch({ type: SCHEDULE_ACTIONS.FETCH_SUCCESS, payload: schedules });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener horarios';
      dispatch({ type: SCHEDULE_ACTIONS.FETCH_FAILURE, payload: errorMessage });
    }
  };

  // Obtener mis horarios (empleado)
  const fetchMySchedules = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: SCHEDULE_ACTIONS.FETCH_MY_START });
      const schedules = await scheduleService.getMySchedules(filters);
      dispatch({ type: SCHEDULE_ACTIONS.FETCH_MY_SUCCESS, payload: schedules });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener mis horarios';
      dispatch({ type: SCHEDULE_ACTIONS.FETCH_MY_FAILURE, payload: errorMessage });
    }
  }, []);

  // Crear horario (admin)
  const createSchedule = async (scheduleData) => {
    try {
      dispatch({ type: SCHEDULE_ACTIONS.CREATE_START });
      const newSchedule = await scheduleService.createSchedule(scheduleData);
      dispatch({ type: SCHEDULE_ACTIONS.CREATE_SUCCESS, payload: newSchedule });
      return newSchedule;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear horario';
      dispatch({ type: SCHEDULE_ACTIONS.CREATE_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Actualizar horario (admin)
  const updateSchedule = async (id, scheduleData) => {
    try {
      dispatch({ type: SCHEDULE_ACTIONS.UPDATE_START });
      const updatedSchedule = await scheduleService.updateSchedule(id, scheduleData);
      dispatch({ type: SCHEDULE_ACTIONS.UPDATE_SUCCESS, payload: updatedSchedule });
      return updatedSchedule;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar horario';
      dispatch({ type: SCHEDULE_ACTIONS.UPDATE_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Eliminar horario (admin)
  const deleteSchedule = async (id) => {
    try {
      dispatch({ type: SCHEDULE_ACTIONS.DELETE_START });
      await scheduleService.deleteSchedule(id);
      dispatch({ type: SCHEDULE_ACTIONS.DELETE_SUCCESS, payload: id });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar horario';
      dispatch({ type: SCHEDULE_ACTIONS.DELETE_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Establecer horario actual
  const setCurrentSchedule = (schedule) => {
    dispatch({ type: SCHEDULE_ACTIONS.SET_CURRENT_SCHEDULE, payload: schedule });
  };

  // Limpiar error
  const clearError = () => {
    dispatch({ type: SCHEDULE_ACTIONS.CLEAR_ERROR });
  };

  // Exportar a PDF
  const exportToPDF = async (filters = {}, title = 'Reporte de Horarios') => {
    try {
      console.log('Exportando a PDF con filtros:', filters, 'título:', title);
      
      // Filtrar datos según los filtros
      let dataToExport = state.schedules.filter(schedule => {
        if (filters.id_empleado && schedule.id_empleado !== parseInt(filters.id_empleado)) {
          return false;
        }
        if (filters.fecha_inicio && schedule.fecha < filters.fecha_inicio) {
          return false;
        }
        if (filters.fecha_fin && schedule.fecha > filters.fecha_fin) {
          return false;
        }
        return true;
      });
      
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configurar fuente para caracteres especiales (español)
      doc.setFont('helvetica');
      
      // Título
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 30);
      
      // Preparar datos para la tabla
      const tableData = dataToExport.map(schedule => [
        schedule.id || '',
        schedule.empleado?.usuario?.nombre || 'Sin nombre',
        schedule.empleado?.usuario?.correo || 'Sin correo',
        schedule.fecha || '',
        schedule.hora_inicio || '',
        schedule.hora_fin || ''
      ]);
      
      // Configurar columnas
      const tableColumns = [
        'ID',
        'Empleado',
        'Correo',
        'Fecha',
        'Hora Inicio',
        'Hora Fin'
      ];
      
      // Agregar tabla
      autoTable(doc, {
        head: [tableColumns],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
      
      // Estadísticas - usar una posición fija como fallback
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;
      doc.setFontSize(12);
      doc.text(`Total de horarios: ${dataToExport.length}`, 14, finalY);
      
      // Guardar PDF
      doc.save(`${title}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      console.log('PDF exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      throw error;
    }
  };

  const value = {
    ...state,
    fetchSchedules,
    fetchMySchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setCurrentSchedule,
    clearError,
    exportToPDF
  };

  return (
    <SchedulesContext.Provider value={value}>
      {children}
    </SchedulesContext.Provider>
  );
};

export const useSchedules = () => {
  const context = useContext(SchedulesContext);
  if (!context) {
    throw new Error('useSchedules must be used within a SchedulesProvider');
  }
  return context;
};