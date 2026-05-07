import React, { createContext, useContext, useReducer } from 'react';
import { scheduleRequestService } from '../services/scheduleRequests';

// Acciones para el reducer
const SCHEDULE_REQUESTS_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Estado inicial
const initialState = {
  scheduleRequests: [],
  loading: false,
  error: null
};

// Reducer
const scheduleRequestsReducer = (state, action) => {
  switch (action.type) {
    case SCHEDULE_REQUESTS_ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    
    case SCHEDULE_REQUESTS_ACTIONS.FETCH_SUCCESS:
      return { ...state, loading: false, scheduleRequests: action.payload || [] };
    
    case SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload || 'Error desconocido' };
    
    case SCHEDULE_REQUESTS_ACTIONS.CREATE_SUCCESS:
      return { 
        ...state, 
        scheduleRequests: action.payload ? [...state.scheduleRequests, action.payload] : state.scheduleRequests 
      };
    
    case SCHEDULE_REQUESTS_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        scheduleRequests: action.payload 
          ? state.scheduleRequests.map(request =>
              request.id === action.payload.id ? action.payload : request
            )
          : state.scheduleRequests
      };
    
    case SCHEDULE_REQUESTS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

const ScheduleRequestsContext = createContext();

export const ScheduleRequestsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleRequestsReducer, initialState);

  // Obtener todas las solicitudes (admin)
  const fetchScheduleRequests = async () => {
    try {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_START });
      const response = await scheduleRequestService.getScheduleRequests();
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_SUCCESS, payload: response });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener solicitudes';
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: errorMessage });
    }
  };

  // Obtener mis solicitudes (empleado)
  const fetchMyScheduleRequests = async () => {
    try {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_START });
      const response = await scheduleRequestService.getMyScheduleRequests();
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_SUCCESS, payload: response });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener solicitudes';
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: errorMessage });
    }
  };

  // Crear nueva solicitud
  const createScheduleRequest = async (requestData) => {
    try {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_START });
      const request = await scheduleRequestService.createScheduleRequest(requestData);
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.CREATE_SUCCESS, payload: request });
      return request;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear solicitud';
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Aprobar/rechazar solicitud (admin)
  const updateScheduleRequest = async (id, action, comentarios_revision) => {
    try {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_START });
      const request = await scheduleRequestService.updateScheduleRequest(id, action, comentarios_revision);
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.UPDATE_SUCCESS, payload: request });
      return request;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar solicitud';
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchScheduleRequests,
    fetchMyScheduleRequests,
    createScheduleRequest,
    updateScheduleRequest,
    clearError
  };

  return (
    <ScheduleRequestsContext.Provider value={value}>
      {children}
    </ScheduleRequestsContext.Provider>
  );
};

export const useScheduleRequests = () => {
  const context = useContext(ScheduleRequestsContext);
  if (!context) {
    throw new Error('useScheduleRequests must be used within a ScheduleRequestsProvider');
  }
  return context;
};
