import React, { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

// Types
interface ScheduleRequest {
  id: number;
  empleado_id: number;
  schedule_id: number;
  tipo_solicitud: 'cambio' | 'intercambio' | 'vacaciones';
  fecha_solicitada: string;
  motivo: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  created_at: string;
  updated_at: string;
}

interface ScheduleRequestsState {
  requests: ScheduleRequest[];
  loading: boolean;
  error: string | null;
}

interface ScheduleRequestsContextType extends ScheduleRequestsState {
  fetchRequests: () => Promise<void>;
  createRequest: (request: Partial<ScheduleRequest>) => Promise<ScheduleRequest>;
  approveRequest: (id: number) => Promise<void>;
  rejectRequest: (id: number, motivo?: string) => Promise<void>;
  clearError: () => void;
}

// Actions
const SCHEDULE_REQUESTS_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  APPROVE_SUCCESS: 'APPROVE_SUCCESS',
  REJECT_SUCCESS: 'REJECT_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState: ScheduleRequestsState = {
  requests: [],
  loading: false,
  error: null,
};

// Reducer
const scheduleRequestsReducer = (state: ScheduleRequestsState, action: any): ScheduleRequestsState => {
  switch (action.type) {
    case SCHEDULE_REQUESTS_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SCHEDULE_REQUESTS_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        requests: action.payload,
        error: null,
      };
    case SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case SCHEDULE_REQUESTS_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        requests: [...state.requests, action.payload],
      };
    case SCHEDULE_REQUESTS_ACTIONS.APPROVE_SUCCESS:
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload
            ? { ...request, estado: 'aprobado' }
            : request
        ),
      };
    case SCHEDULE_REQUESTS_ACTIONS.REJECT_SUCCESS:
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload
            ? { ...request, estado: 'rechazado' }
            : request
        ),
      };
    case SCHEDULE_REQUESTS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const ScheduleRequestsContext = createContext<ScheduleRequestsContextType | undefined>(undefined);

// Provider
export const ScheduleRequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleRequestsReducer, initialState);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_START });
      const response = await api.get('/schedule-requests');
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_SUCCESS, payload: response.data.data });
    } catch (error: any) {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Create request
  const createRequest = async (request: Partial<ScheduleRequest>) => {
    try {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_START });
      const response = await api.post('/schedule-requests', request);
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.CREATE_SUCCESS, payload: response.data.data });
      return response.data.data;
    } catch (error: any) {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: error.message });
      throw error;
    }
  };

  // Approve request
  const approveRequest = async (id: number) => {
    try {
      await api.put(`/schedule-requests/${id}/approve`);
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.APPROVE_SUCCESS, payload: id });
    } catch (error: any) {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Reject request
  const rejectRequest = async (id: number, motivo?: string) => {
    try {
      await api.put(`/schedule-requests/${id}/reject`, { motivo });
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.REJECT_SUCCESS, payload: id });
    } catch (error: any) {
      dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: SCHEDULE_REQUESTS_ACTIONS.CLEAR_ERROR });
  };

  const value: ScheduleRequestsContextType = {
    ...state,
    fetchRequests,
    createRequest,
    approveRequest,
    rejectRequest,
    clearError,
  };

  return (
    <ScheduleRequestsContext.Provider value={value}>
      {children}
    </ScheduleRequestsContext.Provider>
  );
};

// Hook
export const useScheduleRequests = (): ScheduleRequestsContextType => {
  const context = useContext(ScheduleRequestsContext);
  if (context === undefined) {
    throw new Error('useScheduleRequests must be used within a ScheduleRequestsProvider');
  }
  return context;
};
