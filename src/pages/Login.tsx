import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }

    setLoading(false);
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '0 auto',
    background: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: '"Inter", system-ui, sans-serif',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const formContainerStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(74,144,226,0.1)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '32px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px',
    fontFamily: '"Inter", system-ui, sans-serif',
    transition: 'all 0.2s',
    outline: 'none'
  };

  const inputFocusStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#4A90E2',
    boxShadow: '0 0 0 3px rgba(74,144,226,0.1)'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px'
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: 'not-allowed'
  };

  const errorStyle: React.CSSProperties = {
    color: '#e74c3c',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px',
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '8px'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>{t('login_title')}</h1>

        <input
          type="email"
          placeholder={t('email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        <input
          type="password"
          placeholder={t('password_placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        {error && (
          <div style={errorStyle}>
            {t('login_error')}: {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          style={
            !email || !password || loading ? buttonDisabledStyle : buttonStyle
          }
          disabled={!email || !password || loading}
          onMouseEnter={(e) => {
            if (!loading && email && password) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 4px 15px rgba(74,144,226,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? t('login_loading') : t('login_button')}
        </button>
      </div>
    </div>
  );
};

export default Login;
