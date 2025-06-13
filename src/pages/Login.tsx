import React from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { handlePendingInvitation } from '../utils/inviteHandler'; // ✅ YENİ IMPORT

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resetMessage, setResetMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false);

  // PWA: Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load remembered email on component mount
  React.useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('rememberEmail');

    if (savedRememberMe === 'true' && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // ✅ YENİ FONKSİYON - Login başarılı sonrası işlemler
  const handleLoginSuccess = async () => {
    try {
      console.log('Login successful, checking for pending invitations...');

      // Bekleyen davetiye kontrolü
      const redirectUrl = await handlePendingInvitation(t);

      if (redirectUrl) {
        console.log('Redirecting to event:', redirectUrl);
        // Davet varsa event sayfasına yönlendir
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else {
        console.log('No pending invitation, redirecting to home');
        // Normal login flow'u
        setTimeout(() => {
          window.location.href = '/home';
        }, 500);
      }
    } catch (error) {
      console.error('Error in login success handler:', error);
      // Hata durumunda da home'a yönlendir
      setTimeout(() => {
        window.location.href = '/home';
      }, 500);
    }
  };

  const handleLogin = async () => {
    if (!isOnline) {
      setError(t('no_internet_connection'));
      return;
    }

    if (!email.trim()) {
      setError(t('email_required'));
      return;
    }

    if (!password.trim()) {
      setError(t('password_required'));
      return;
    }

    setLoading(true);
    setError(null);
    setResetMessage(null);

    try {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberEmail');
      }

      // Supabase authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password: password
        }
      );

      if (authError) {
        console.error('Login error:', authError);

        // Handle specific error types
        if (authError.message.includes('Invalid login credentials')) {
          setError(t('invalid_credentials'));
        } else if (authError.message.includes('Email not confirmed')) {
          setError(t('email_not_confirmed'));
        } else if (authError.message.includes('Too many requests')) {
          setError(t('too_many_attempts'));
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user && data.session) {
        console.log('Login successful:', data.user.email);
        toast.success(t('login_successful'));

        // ✅ GÜNCEL - Invitation kontrolü ile yönlendirme
        await handleLoginSuccess();
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError(t('login_failed_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError(t('email_required_reset'));
      return;
    }

    if (!isOnline) {
      setError(t('no_internet_connection'));
      return;
    }

    setResetLoading(true);
    setError(null);
    setResetMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (resetError) {
        console.error('Password reset error:', resetError);
        setError(resetError.message);
        return;
      }

      setResetMessage(t('password_reset_sent'));
      toast.success(t('password_reset_sent'));
    } catch (err) {
      console.error('Unexpected password reset error:', err);
      setError(t('password_reset_failed'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password && !loading && isOnline) {
      handleLogin();
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100%',
      background:
        'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      padding:
        'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
      position: 'relative' as const,
      overflow: 'hidden'
    },

    floatingElement: {
      position: 'absolute' as const,
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'float 8s ease-in-out infinite'
    },

    formContainer: {
      background: 'rgba(26, 26, 46, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: 'clamp(2rem, 5vw, 3rem)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '400px',
      position: 'relative' as const,
      zIndex: 2
    },

    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },

    backButton: {
      background: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      padding: '12px 20px',
      minHeight: '44px',
      color: '#b0b0b0',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent'
    },

    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: 'white',
      marginBottom: '0.5rem',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },

    subtitle: {
      fontSize: '1rem',
      color: '#b0b0b0',
      marginBottom: '0'
    },

    inputGroup: {
      marginBottom: '1.5rem'
    },

    input: {
      width: '100%',
      padding: '1rem',
      minHeight: '44px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      fontSize: '16px',
      color: 'white',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box' as const,
      WebkitAppearance: 'none' as const,
      WebkitTapHighlightColor: 'transparent'
    },

    inputFocus: {
      borderColor: '#00f5ff',
      boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.08)'
    },

    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '1.5rem',
      cursor: 'pointer',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent'
    },

    checkbox: {
      width: '18px',
      height: '18px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      cursor: 'pointer',
      position: 'relative' as const,
      transition: 'all 0.3s ease',
      minWidth: '18px',
      WebkitAppearance: 'none' as const,
      appearance: 'none' as const
    },

    checkboxChecked: {
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      borderColor: '#00f5ff'
    },

    checkboxLabel: {
      color: '#e2e8f0',
      fontSize: '14px',
      cursor: 'pointer'
    },

    button: {
      width: '100%',
      padding: '1rem',
      minHeight: '48px',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '0.5rem',
      position: 'relative' as const,
      overflow: 'hidden',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent',
      WebkitAppearance: 'none' as const
    },

    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },

    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 30px rgba(0, 245, 255, 0.4)'
    },

    error: {
      color: '#ff006e',
      fontSize: '14px',
      marginBottom: '1rem',
      padding: '0.75rem',
      background: 'rgba(255, 0, 110, 0.1)',
      border: '1px solid rgba(255, 0, 110, 0.2)',
      borderRadius: '8px',
      textAlign: 'center' as const
    },

    successMessage: {
      color: '#4CAF50',
      fontSize: '14px',
      marginBottom: '1rem',
      padding: '0.75rem',
      background: 'rgba(76, 175, 80, 0.1)',
      border: '1px solid rgba(76, 175, 80, 0.2)',
      borderRadius: '8px',
      textAlign: 'center' as const
    },

    forgotPasswordLink: {
      textAlign: 'center' as const,
      marginTop: '1rem'
    },

    forgotPasswordButton: {
      background: 'transparent',
      border: 'none',
      color: '#00f5ff',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'underline',
      transition: 'all 0.3s ease',
      padding: '4px 8px',
      borderRadius: '4px',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent',
      disabled: resetLoading
    } as React.CSSProperties,

    languageSelector: {
      position: 'absolute' as const,
      top: 'env(safe-area-inset-top, 30px)',
      right: 'env(safe-area-inset-right, 30px)',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '8px 12px',
      display: 'flex',
      gap: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 10
    },

    languageButton: {
      background: 'transparent',
      border: 'none',
      color: '#b0b0b0',
      fontSize: '12px',
      fontWeight: '600',
      padding: '6px 10px',
      minHeight: '32px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent'
    },

    languageButtonActive: {
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      color: 'white'
    },

    offlineMessage: {
      position: 'fixed' as const,
      top: 'env(safe-area-inset-top, 20px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255, 193, 7, 0.9)',
      color: '#000',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      animation: 'slideDown 0.3s ease-out'
    },

    networkIndicator: {
      position: 'absolute' as const,
      top: '10px',
      left: '10px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: isOnline ? '#4CAF50' : '#f44336',
      boxShadow: `0 0 10px ${isOnline ? '#4CAF50' : '#f44336'}`
    }
  };

  return (
    <div style={styles.container}>
      {/* Background floating elements */}
      <div
        style={{
          ...styles.floatingElement,
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'rgba(0, 245, 255, 0.1)',
          animationDelay: '0s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 0, 110, 0.1)',
          animationDelay: '3s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          top: '60%',
          left: '20%',
          width: '100px',
          height: '100px',
          background: 'rgba(131, 56, 236, 0.1)',
          animationDelay: '6s'
        }}
      />

      {/* Network Status Indicator & Offline Message */}
      {showOfflineMessage && (
        <div style={styles.offlineMessage}>📡 {t('offline_message')}</div>
      )}

      {/* Language Selector */}
      <div style={styles.languageSelector}>
        <button
          style={{
            ...styles.languageButton,
            ...(i18n.language === 'en' ? styles.languageButtonActive : {})
          }}
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
        <button
          style={{
            ...styles.languageButton,
            ...(i18n.language === 'tr' ? styles.languageButtonActive : {})
          }}
          onClick={() => changeLanguage('tr')}
        >
          TR
        </button>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          * {
            box-sizing: border-box !important;
          }
          
          html {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }
          
          body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }
          
          #root {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(2deg); }
            66% { transform: translateY(10px) rotate(-2deg); }
          }

          @keyframes slideDown {
            from {
              transform: translateX(-50%) translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          /* Custom checkbox checkmark */
          input[type="checkbox"]:checked::after {
            content: "✓";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: bold;
          }

          /* PWA-specific styles */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Prevent zoom on iOS */
          input[type="email"],
          input[type="password"] {
            font-size: 16px !important;
          }

          /* Better focus indicators for accessibility */
          button:focus-visible,
          input:focus-visible {
            outline: 2px solid #00f5ff;
            outline-offset: 2px;
          }

          /* PWA-style scrolling */
          * {
            -webkit-overflow-scrolling: touch;
          }

          /* Centering container */
          .login-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            min-height: 100vh !important;
            padding: 0 2rem !important;
          }

          @media (max-width: 480px) {
            .form-container {
              padding: 1.5rem !important;
              margin: 0.5rem !important;
              border-radius: 20px !important;
            }
            .language-selector {
              top: env(safe-area-inset-top, 20px) !important;
              right: env(safe-area-inset-right, 20px) !important;
            }
            .login-container {
              padding: 0 1rem !important;
            }
          }

          /* Support for PWA display modes */
          @media (display-mode: standalone) {
            .login-container {
              padding-top: env(safe-area-inset-top, 20px);
            }
          }

          /* Reduce motion for accessibility */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .form-container {
              border: 2px solid white !important;
            }
            input {
              border: 2px solid rgba(255, 255, 255, 0.5) !important;
            }
          }
        `}
      </style>

      {/* Centered login form */}
      <div className="login-container">
        <div style={styles.formContainer} className="form-container">
          {/* Network Status Indicator */}
          <div
            style={styles.networkIndicator}
            title={isOnline ? 'Online' : 'Offline'}
          ></div>

          <div style={styles.header}>
            <button
              style={styles.backButton}
              onClick={handleBackToHome}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#b0b0b0';
              }}
            >
              ← {t('back_to_home')}
            </button>
            <h1 style={styles.title}>{t('login_title')}</h1>
            <p style={styles.subtitle}>{t('welcome_back')}</p>
          </div>

          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder={t('email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.input}
              onFocus={(e) => {
                Object.assign(e.target.style, styles.inputFocus);
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, styles.input);
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder={t('password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.input}
              onFocus={(e) => {
                Object.assign(e.target.style, styles.inputFocus);
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, styles.input);
              }}
            />
          </div>

          {/* Remember Me Checkbox */}
          <div
            style={styles.checkboxContainer}
            onClick={() => setRememberMe(!rememberMe)}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                ...styles.checkbox,
                ...(rememberMe ? styles.checkboxChecked : {})
              }}
            />
            <label style={styles.checkboxLabel}>{t('remember_me')}</label>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {resetMessage && (
            <div style={styles.successMessage}>{resetMessage}</div>
          )}

          <button
            onClick={handleLogin}
            style={{
              ...styles.button,
              ...(!email || !password || loading || !isOnline
                ? styles.buttonDisabled
                : {})
            }}
            disabled={!email || !password || loading || !isOnline}
            onMouseEnter={(e) => {
              if (!loading && email && password && isOnline) {
                Object.assign(e.currentTarget.style, styles.buttonHover);
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></span>
                {t('login_loading')}
              </span>
            ) : !isOnline ? (
              '📡 Offline'
            ) : (
              t('login_button')
            )}
          </button>

          {/* Forgot Password Link */}
          <div style={styles.forgotPasswordLink}>
            <button
              style={{
                ...styles.forgotPasswordButton,
                opacity: resetLoading ? 0.5 : 1,
                cursor: resetLoading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleForgotPassword}
              disabled={resetLoading}
              onMouseEnter={(e) => {
                if (!resetLoading) {
                  e.currentTarget.style.color = '#ff006e';
                  e.currentTarget.style.background = 'rgba(255, 0, 110, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!resetLoading) {
                  e.currentTarget.style.color = '#00f5ff';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {resetLoading ? t('sending') : t('forgot_password')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
