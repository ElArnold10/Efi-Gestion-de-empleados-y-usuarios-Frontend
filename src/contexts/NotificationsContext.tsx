import React, { createContext, useContext, useReducer } from 'react';

// Types
interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  leida: boolean;
  created_at: string;
}

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

interface NotificationsContextType extends NotificationsState {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

// Actions
const NOTIFICATIONS_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  MARK_READ: 'MARK_READ',
  MARK_ALL_READ: 'MARK_ALL_READ',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

// Reducer
const notificationsReducer = (state: NotificationsState, action: any): NotificationsState => {
  switch (action.type) {
    case NOTIFICATIONS_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case NOTIFICATIONS_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload,
        unreadCount: action.payload.filter((n: Notification) => !n.leida).length,
        error: null,
      };
    case NOTIFICATIONS_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case NOTIFICATIONS_ACTIONS.MARK_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, leida: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case NOTIFICATIONS_ACTIONS.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          leida: true,
        })),
        unreadCount: 0,
      };
    case NOTIFICATIONS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Provider
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      dispatch({ type: NOTIFICATIONS_ACTIONS.FETCH_START });
      // Por ahora, datos de ejemplo hasta implementar el backend
      const mockNotifications: Notification[] = [
        {
          id: 1,
          titulo: 'Nueva solicitud de empleado',
          mensaje: 'Juan Pérez ha solicitado registrarse como empleado',
          tipo: 'info',
          leida: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          titulo: 'Horario actualizado',
          mensaje: 'El horario del turno mañana ha sido modificado',
          tipo: 'success',
          leida: false,
          created_at: new Date().toISOString(),
        },
      ];
      
      dispatch({ type: NOTIFICATIONS_ACTIONS.FETCH_SUCCESS, payload: mockNotifications });
    } catch (error: any) {
      dispatch({ type: NOTIFICATIONS_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Mark as read
  const markAsRead = async (id: number) => {
    try {
      // Aquí iría la llamada al backend
      dispatch({ type: NOTIFICATIONS_ACTIONS.MARK_READ, payload: id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Aquí iría la llamada al backend
      dispatch({ type: NOTIFICATIONS_ACTIONS.MARK_ALL_READ });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: NOTIFICATIONS_ACTIONS.CLEAR_ERROR });
  };

  const value: NotificationsContextType = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearError,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook
export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
