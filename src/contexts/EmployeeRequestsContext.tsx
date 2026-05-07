import React, { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

// Types
interface EmployeeRequest {
  id: number;
  id_usuario: number;
  posicion_deseada: string;
  mensaje?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
  fecha_revision?: string;
  revisado_por?: number;
  comentarios_admin?: string;
  created_at: string;
  updated_at: string;
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    is_active: boolean;
    created_at: string;
  };
  revisor?: {
    id: number;
    nombre: string;
    correo: string;
  };
}

interface EmployeeRequestsState {
  requests: EmployeeRequest[];
  loading: boolean;
  error: string | null;
}

interface EmployeeRequestsContextType extends EmployeeRequestsState {
  fetchRequests: () => Promise<void>;
  approveRequest: (id: number, posicion?: string) => Promise<void>;
  rejectRequest: (id: number, motivo?: string) => Promise<void>;
  clearError: () => void;
}

// Actions
const EMPLOYEE_REQUESTS_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  APPROVE_SUCCESS: 'APPROVE_SUCCESS',
  REJECT_SUCCESS: 'REJECT_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState: EmployeeRequestsState = {
  requests: [],
  loading: false,
  error: null,
};

// Reducer
const employeeRequestsReducer = (state: EmployeeRequestsState, action: any): EmployeeRequestsState => {
  switch (action.type) {
    case EMPLOYEE_REQUESTS_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case EMPLOYEE_REQUESTS_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        requests: action.payload,
        error: null,
      };
    case EMPLOYEE_REQUESTS_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case EMPLOYEE_REQUESTS_ACTIONS.APPROVE_SUCCESS:
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload
            ? { ...request, estado: 'aprobada' }
            : request
        ),
      };
    case EMPLOYEE_REQUESTS_ACTIONS.REJECT_SUCCESS:
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload
            ? { ...request, estado: 'rechazada' }
            : request
        ),
      };
    case EMPLOYEE_REQUESTS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const EmployeeRequestsContext = createContext<EmployeeRequestsContextType | undefined>(undefined);

// Provider
export const EmployeeRequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(employeeRequestsReducer, initialState);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.FETCH_START });
      const response = await api.get('/employee-requests');
      dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.FETCH_SUCCESS, payload: response.data.data.requests || [] });
    } catch (error: any) {
      dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Approve request
  const approveRequest = async (id: number, posicion?: string) => {
    try {
      const payload = posicion ? { posicion } : {};
      await api.put(`/employee-requests/${id}/approve`, payload);
      dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.APPROVE_SUCCESS, payload: id });
    } catch (error: any) {
      dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Reject request
  const rejectRequest = async (id: number, motivo?: string) => {
    try {
      await api.put(`/employee-requests/${id}/reject`, { motivo });
      dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.REJECT_SUCCESS, payload: id });
    } catch (error: any) {
      dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: EMPLOYEE_REQUESTS_ACTIONS.CLEAR_ERROR });
  };

  const value: EmployeeRequestsContextType = {
    ...state,
    fetchRequests,
    approveRequest,
    rejectRequest,
    clearError,
  };

  return (
    <EmployeeRequestsContext.Provider value={value}>
      {children}
    </EmployeeRequestsContext.Provider>
  );
};

// Hook
export const useEmployeeRequests = (): EmployeeRequestsContextType => {
  const context = useContext(EmployeeRequestsContext);
  if (context === undefined) {
    throw new Error('useEmployeeRequests must be used within an EmployeeRequestsProvider');
  }
  return context;
};