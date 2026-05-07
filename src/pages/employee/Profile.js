import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RoleGuard from '../../components/auth/RoleGuard';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    correo: user?.correo || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        correo: user.correo || ''
      }));
    }
  }, [user]);

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateProfile({
        nombre: formData.nombre,
        correo: formData.correo
      });
      setMessage('Perfil actualizado exitosamente');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validar contraseñas
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.currentPassword) {
      setError('Debes ingresar tu contraseña actual');
      setLoading(false);
      return;
    }

    try {
      // Aquí iría la lógica para actualizar la contraseña
      // Por ahora, simularemos una actualización exitosa
      setTimeout(() => {
        setMessage('Contraseña actualizada exitosamente');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Error al actualizar la contraseña');
      setLoading(false);
    }
  };

  return (
    <RoleGuard requiredRole="empleado">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-text">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.nombre || 'Usuario'}</h1>
            <p className="profile-email">{user?.correo || 'correo@ejemplo.com'}</p>
            <span className="profile-role">{user?.rol || 'empleado'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            Información Personal
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span className="tab-icon">🔒</span>
            Cambiar Contraseña
          </button>
          <button
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span className="tab-icon">⚙️</span>
            Información de Cuenta
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Información Personal</h2>
                <p>Actualiza tu información personal</p>
              </div>
              
              {message && (
                <div className="alert alert-success">
                  <span className="alert-icon">✅</span>
                  <span>{message}</span>
                </div>
              )}
              
              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <div className="input-group">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <div className="input-group">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      Actualizar Perfil
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Cambiar Contraseña</h2>
                <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
              </div>
              
              {message && (
                <div className="alert alert-success">
                  <span className="alert-icon">✅</span>
                  <span>{message}</span>
                </div>
              )}
              
              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Contraseña Actual</label>
                  <div className="input-group">
                    <span className="input-icon">🔒</span>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <div className="input-group">
                    <span className="input-icon">🔑</span>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <div className="input-group">
                    <span className="input-icon">🔑</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🔒</span>
                      Cambiar Contraseña
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Account Info Tab */}
          {activeTab === 'account' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Información de la Cuenta</h2>
                <p>Detalles de tu cuenta y estado</p>
              </div>
              
              <div className="account-info-grid">
                <div className="info-card">
                  <div className="info-icon">
                    <span>👤</span>
                  </div>
                  <div className="info-content">
                    <p className="info-label">Rol</p>
                    <p className="info-value capitalize">{user?.rol || 'empleado'}</p>
                  </div>
                </div>
                
                <div className="info-card">
                  <div className="info-icon">
                    <span>📅</span>
                  </div>
                  <div className="info-content">
                    <p className="info-label">Fecha de Registro</p>
                    <p className="info-value">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="info-card">
                  <div className="info-icon">
                    <span>✅</span>
                  </div>
                  <div className="info-content">
                    <p className="info-label">Estado</p>
                    <p className="info-value status-active">Activo</p>
                  </div>
                </div>
                
                <div className="info-card">
                  <div className="info-icon">
                    <span>🆔</span>
                  </div>
                  <div className="info-content">
                    <p className="info-label">ID de Usuario</p>
                    <p className="info-value">#{user?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default Profile;
