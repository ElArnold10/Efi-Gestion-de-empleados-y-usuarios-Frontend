import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Mostrar mensaje de registro exitoso si viene de register
  useEffect(() => {
    if (location.state?.message) {
      // El mensaje se mostrará a través de un estado local
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores de validación
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Limpiar error de autenticación
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.correo) {
      errors.correo = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El email no es válido';
    }
    
    if (!formData.contraseña) {
      errors.contraseña = 'La contraseña es obligatoria';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      
      // Redirigir según el rol del usuario
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.rol === 'admin') {
        navigate('/admin/employees', { replace: true });
      } else if (user?.rol === 'empleado') {
        navigate('/employee/profile', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      // El error ya se maneja en el contexto
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">
            Ingresa tus credenciales para acceder
          </p>
          
          {/* Mensaje de registro exitoso */}
          {location.state?.message && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              <span>{location.state.message}</span>
            </div>
          )}
          
          <p className="login-register-link">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="link">
              Regístrate
            </Link>
          </p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`form-input ${validationErrors.correo ? 'error' : ''}`}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              {validationErrors.correo && (
                <p className="error-message">{validationErrors.correo}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  className={`form-input ${validationErrors.contraseña ? 'error' : ''}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePassword}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.contraseña && (
                <p className="error-message">{validationErrors.contraseña}</p>
              )}
            </div>
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <span className="btn-icon">🔑</span>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <p className="demo-title">Credenciales de Demo:</p>
            <div className="demo-info">
              <div className="demo-item">
                <span className="demo-role">Administrador:</span>
                <span className="demo-credentials">admin@example.com / admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
