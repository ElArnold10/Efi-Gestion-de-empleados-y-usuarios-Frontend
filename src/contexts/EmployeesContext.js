import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { employeeService } from '../services/employees';

// Estado inicial
const initialState = {
  employees: [],
  loading: false,
  error: null,
  currentEmployee: null
};

// Actions
const EMPLOYEE_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  CREATE_START: 'CREATE_START',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  CREATE_FAILURE: 'CREATE_FAILURE',
  UPDATE_START: 'UPDATE_START',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  UPDATE_FAILURE: 'UPDATE_FAILURE',
  DELETE_START: 'DELETE_START',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  DELETE_FAILURE: 'DELETE_FAILURE',
  SET_CURRENT_EMPLOYEE: 'SET_CURRENT_EMPLOYEE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const employeeReducer = (state, action) => {
  switch (action.type) {
    case EMPLOYEE_ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case EMPLOYEE_ACTIONS.FETCH_SUCCESS:
      return { ...state, loading: false, employees: action.payload, error: null };
    case EMPLOYEE_ACTIONS.FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case EMPLOYEE_ACTIONS.CREATE_START:
      return { ...state, loading: true, error: null };
    case EMPLOYEE_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        employees: [...state.employees, action.payload],
        error: null
      };
    case EMPLOYEE_ACTIONS.CREATE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case EMPLOYEE_ACTIONS.UPDATE_START:
      return { ...state, loading: true, error: null };
    case EMPLOYEE_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        employees: state.employees.map(employee =>
          employee.id === action.payload.id ? action.payload : employee
        ),
        error: null
      };
    case EMPLOYEE_ACTIONS.UPDATE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case EMPLOYEE_ACTIONS.DELETE_START:
      return { ...state, loading: true, error: null };
    case EMPLOYEE_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        employees: state.employees.filter(employee => employee.id !== action.payload),
        error: null
      };
    case EMPLOYEE_ACTIONS.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case EMPLOYEE_ACTIONS.SET_CURRENT_EMPLOYEE:
      return { ...state, currentEmployee: action.payload };
    case EMPLOYEE_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
const EmployeesContext = createContext();

// Provider
export const EmployeesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState);

  // Obtener todos los empleados (admin)
  const fetchEmployees = useCallback(async () => {
    try {
      dispatch({ type: EMPLOYEE_ACTIONS.FETCH_START });
      const employees = await employeeService.getEmployees();
      dispatch({ type: EMPLOYEE_ACTIONS.FETCH_SUCCESS, payload: employees });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al obtener empleados';
      dispatch({ type: EMPLOYEE_ACTIONS.FETCH_FAILURE, payload: errorMessage });
    }
  }, []);

  // Crear empleado (admin)
  const createEmployee = useCallback(async (employeeData) => {
    try {
      dispatch({ type: EMPLOYEE_ACTIONS.CREATE_START });
      const newEmployee = await employeeService.createEmployee(employeeData);
      dispatch({ type: EMPLOYEE_ACTIONS.CREATE_SUCCESS, payload: newEmployee });
      return newEmployee;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al crear empleado';
      dispatch({ type: EMPLOYEE_ACTIONS.CREATE_FAILURE, payload: errorMessage });
      throw error;
    }
  }, []);

  // Actualizar empleado (admin)
  const updateEmployee = async (id, employeeData) => {
    try {
      dispatch({ type: EMPLOYEE_ACTIONS.UPDATE_START });
      const updatedEmployee = await employeeService.updateEmployee(id, employeeData);
      dispatch({ type: EMPLOYEE_ACTIONS.UPDATE_SUCCESS, payload: updatedEmployee });
      return updatedEmployee;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar empleado';
      dispatch({ type: EMPLOYEE_ACTIONS.UPDATE_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Eliminar empleado (admin)
  const deleteEmployee = useCallback(async (id) => {
    try {
      dispatch({ type: EMPLOYEE_ACTIONS.DELETE_START });
      await employeeService.deleteEmployee(id);
      dispatch({ type: EMPLOYEE_ACTIONS.DELETE_SUCCESS, payload: id });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al eliminar empleado';
      dispatch({ type: EMPLOYEE_ACTIONS.DELETE_FAILURE, payload: errorMessage });
      throw error;
    }
  }, []);

  // Establecer empleado actual
  const setCurrentEmployee = (employee) => {
    dispatch({ type: EMPLOYEE_ACTIONS.SET_CURRENT_EMPLOYEE, payload: employee });
  };

  // Limpiar error
  const clearError = () => {
    dispatch({ type: EMPLOYEE_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setCurrentEmployee,
    clearError
  };

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
};

// Hook
export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeesProvider');
  }
  return context;
};
