import React, { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

// Types
interface Employee {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  posicion: string;
  rol: 'admin' | 'empleado' | 'usuario';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmployeesState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

interface EmployeesContextType extends EmployeesState {
  fetchEmployees: () => Promise<void>;
  createEmployee: (employee: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: number, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  clearError: () => void;
}

// Actions
const EMPLOYEES_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null,
};

// Reducer
const employeesReducer = (state: EmployeesState, action: any): EmployeesState => {
  switch (action.type) {
    case EMPLOYEES_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case EMPLOYEES_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        employees: action.payload,
        error: null,
      };
    case EMPLOYEES_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case EMPLOYEES_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        employees: [...state.employees, action.payload],
      };
    case EMPLOYEES_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        employees: state.employees.map(employee =>
          employee.id === action.payload.id
            ? { ...employee, ...action.payload }
            : employee
        ),
      };
    case EMPLOYEES_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        employees: state.employees.filter(employee => employee.id !== action.payload),
      };
    case EMPLOYEES_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined);

// Provider
export const EmployeesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(employeesReducer, initialState);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      dispatch({ type: EMPLOYEES_ACTIONS.FETCH_START });
      const response = await api.get('/employees');
      dispatch({ type: EMPLOYEES_ACTIONS.FETCH_SUCCESS, payload: response.data.data });
    } catch (error: any) {
      dispatch({ type: EMPLOYEES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Create employee
  const createEmployee = async (employee: Partial<Employee>) => {
    try {
      const response = await api.post('/employees', employee);
      dispatch({ type: EMPLOYEES_ACTIONS.CREATE_SUCCESS, payload: response.data.data });
    } catch (error: any) {
      dispatch({ type: EMPLOYEES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Update employee
  const updateEmployee = async (id: number, employee: Partial<Employee>) => {
    try {
      const response = await api.put(`/employees/${id}`, employee);
      dispatch({ type: EMPLOYEES_ACTIONS.UPDATE_SUCCESS, payload: response.data.data });
    } catch (error: any) {
      dispatch({ type: EMPLOYEES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Delete employee
  const deleteEmployee = async (id: number) => {
    try {
      await api.delete(`/employees/${id}`);
      dispatch({ type: EMPLOYEES_ACTIONS.DELETE_SUCCESS, payload: id });
    } catch (error: any) {
      dispatch({ type: EMPLOYEES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: EMPLOYEES_ACTIONS.CLEAR_ERROR });
  };

  const value: EmployeesContextType = {
    ...state,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    clearError,
  };

  return (
    <EmployeesContext.Provider value={value}>
      {children}
    </EmployeesContext.Provider>
  );
};

// Hook
export const useEmployees = (): EmployeesContextType => {
  const context = useContext(EmployeesContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeesProvider');
  }
  return context;
};
