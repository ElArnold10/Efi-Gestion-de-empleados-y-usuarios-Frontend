import React, { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

// Types
interface Schedule {
  id: number;
  empleado_id: number;
  dia_semana: string;
  hora_entrada: string;
  hora_salida: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface SchedulesState {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
}

interface SchedulesContextType extends SchedulesState {
  fetchSchedules: () => Promise<void>;
  createSchedule: (schedule: Partial<Schedule>) => Promise<void>;
  updateSchedule: (id: number, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
  clearError: () => void;
}

// Actions
const SCHEDULES_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState: SchedulesState = {
  schedules: [],
  loading: false,
  error: null,
};

// Reducer
const schedulesReducer = (state: SchedulesState, action: any): SchedulesState => {
  switch (action.type) {
    case SCHEDULES_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SCHEDULES_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        schedules: action.payload,
        error: null,
      };
    case SCHEDULES_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case SCHEDULES_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        schedules: [...state.schedules, action.payload],
      };
    case SCHEDULES_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        schedules: state.schedules.map(schedule =>
          schedule.id === action.payload.id
            ? { ...schedule, ...action.payload }
            : schedule
        ),
      };
    case SCHEDULES_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        schedules: state.schedules.filter(schedule => schedule.id !== action.payload),
      };
    case SCHEDULES_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const SchedulesContext = createContext<SchedulesContextType | undefined>(undefined);

// Provider
export const SchedulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(schedulesReducer, initialState);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      dispatch({ type: SCHEDULES_ACTIONS.FETCH_START });
      const response = await api.get('/schedules');
      dispatch({ type: SCHEDULES_ACTIONS.FETCH_SUCCESS, payload: response.data.data });
    } catch (error: any) {
      dispatch({ type: SCHEDULES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Create schedule
  const createSchedule = async (schedule: Partial<Schedule>) => {
    try {
      const response = await api.post('/schedules', schedule);
      dispatch({ type: SCHEDULES_ACTIONS.CREATE_SUCCESS, payload: response.data.data });
    } catch (error: any) {
      dispatch({ type: SCHEDULES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Update schedule
  const updateSchedule = async (id: number, schedule: Partial<Schedule>) => {
    try {
      const response = await api.put(`/schedules/${id}`, schedule);
      dispatch({ type: SCHEDULES_ACTIONS.UPDATE_SUCCESS, payload: response.data.data });
    } catch (error: any) {
      dispatch({ type: SCHEDULES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Delete schedule
  const deleteSchedule = async (id: number) => {
    try {
      await api.delete(`/schedules/${id}`);
      dispatch({ type: SCHEDULES_ACTIONS.DELETE_SUCCESS, payload: id });
    } catch (error: any) {
      dispatch({ type: SCHEDULES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: SCHEDULES_ACTIONS.CLEAR_ERROR });
  };

  const value: SchedulesContextType = {
    ...state,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    clearError,
  };

  return (
    <SchedulesContext.Provider value={value}>
      {children}
    </SchedulesContext.Provider>
  );
};

// Hook
export const useSchedules = (): SchedulesContextType => {
  const context = useContext(SchedulesContext);
  if (context === undefined) {
    throw new Error('useSchedules must be used within a SchedulesProvider');
  }
  return context;
};
