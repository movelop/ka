import React, { useContext, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../hooks/api';
import { useStateContext } from '../context/ContextProvider';
import { AuthContext } from '../context/AuthContextProvider';

const Login = () => {
  const { currentColor } = useStateContext();
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
  });
  const { loading, error, dispatch } = useContext(AuthContext);
  const location = useLocation();
  const state = location.state;
  const from = state?.from || '/';
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await api.post('/auth/login', credentials);
      if(res.data.user.isAdmin) {
       dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            ...res.data?.user,
            token: res.data?.token,
          },
        });
        navigate(from);
      } else{
        dispatch({ type: 'LOGIN_FAILURE', payload: { message: 'You are not an Admin!!!' } });
      }
      navigate(from);
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response.data });
    }
  }
  return (
     <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '1.5rem',
    }}>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>

        {/* Top accent bar */}
        <div style={{ height: '4px', background: currentColor, width: '100%' }} />

        <div style={{ padding: '2.5rem 2rem 2rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px', height: '48px',
              borderRadius: '12px',
              background: `${currentColor}18`,
              marginBottom: '1rem',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={currentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              Sign in to K.A Hotel & Suites
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={credentials.username}
                placeholder="Username or email address"
                onChange={handleChange}
                autoComplete="username"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#1f2937',
                  background: '#f9fafb',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = currentColor}
                onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                placeholder="Enter your password"
                onChange={handleChange}
                autoComplete="current-password"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#1f2937',
                  background: '#f9fafb',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = currentColor}
                onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }} role="alert">
                  {error.message}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                marginTop: '4px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                background: loading ? '#9ca3af' : currentColor,
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s, transform 0.1s',
                boxShadow: loading ? 'none' : `0 4px 14px ${currentColor}40`,
              }}
              onMouseEnter={e => { if (!loading) e.target.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.target.style.opacity = '1'; }}
              onMouseDown={e  => { if (!loading) e.target.style.transform = 'scale(0.98)'; }}
              onMouseUp={e    => { e.target.style.transform = 'scale(1)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>

          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#d1d5db', marginTop: '1.5rem' }}>
            © {new Date().getFullYear()} K.A Hotel & Suites
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Login;