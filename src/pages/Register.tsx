import React from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [preferredLanguage, setPreferredLanguage] = React.useState('en');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false);
  // Small delay function
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Generate divido_number: 2 capital letters + 6 digits (e.g., "AB123456")
  const generateDividoNumber = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';

    let result = '';

    // Generate 2 capital letters
    for (let i = 0; i < 2; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Generate 6 digits
    for (let i = 0; i < 6; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return result;
  };

  const handleRegister = async () => {
    if (!isOnline) {
      setError(t('no_internet_connection'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('password_too_short'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Supabase auth.signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            preferred_language: preferredLanguage
          }
        }
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Check if user was created successfully
      if (!authData.user?.id) {
        setError(t('registration_failed'));
        setLoading(false);
        return;
      }

      await sleep(1500);

      // 2️⃣ Generate divido_number
      const dividoNumber = generateDividoNumber();

      // 3️⃣ Insert into users table, with retry logic
      let retries = 3;
      let insertSuccess = false;

      while (retries > 0 && !insertSuccess) {
        const { error: insertError } = await supabase.from('users').upsert(
          {
            auth_user_id: authData.user.id,
            email: email,
            preferred_lang: preferredLanguage,
            divido_number: dividoNumber
          },
          { onConflict: 'auth_user_id' }
        );

        console.error('Insert error:', insertError);
        if (!insertError) {
          insertSuccess = true;
          break;
        } else {
          console.warn(
            `Retrying insert into users table... (${4 - retries}/3)`
          );
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
          retries--;
        }
      }

      if (!insertSuccess) {
        console.error('Error inserting user data after retries');
        setError(t('registration_failed'));
        setLoading(false);
        return;
      }

      // 4️⃣ Success: Change language and redirect
      toast.success(t('registration_successful'));

      // Bekle, kullanıcı tostu görsün
      await sleep(1500); // 1.5 saniye bekle

      // Change app language to user's preferred language
      i18n.changeLanguage(preferredLanguage);

      window.location.href = '/login';
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('registration_failed'));
    }

    setLoading(false);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const isFormValid =
    email && password && confirmPassword && password === confirmPassword;

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

    select: {
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
      WebkitTapHighlightColor: 'transparent',
      cursor: 'pointer',
      backgroundImage:
        "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '16px',
      paddingRight: '3rem'
    },

    selectOption: {
      background: '#1a1a2e',
      color: 'white',
      padding: '0.5rem'
    },

    inputFocus: {
      borderColor: '#00f5ff',
      boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.08)'
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
    },

    loginLink: {
      textAlign: 'center' as const,
      marginTop: '1.5rem',
      padding: '1rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },

    loginLinkText: {
      color: '#b0b0b0',
      fontSize: '14px',
      marginBottom: '0.5rem'
    },

    loginLinkButton: {
      background: 'transparent',
      border: '1px solid rgba(0, 245, 255, 0.3)',
      borderRadius: '8px',
      padding: '8px 16px',
      color: '#00f5ff',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent'
    }
  };

  return (
    <div style={styles.container}>
      {/* Background floating elements */}
      <div
        style={{
          ...styles.floatingElement,
          top: '15%',
          left: '15%',
          width: '180px',
          height: '180px',
          background: 'rgba(0, 245, 255, 0.1)',
          animationDelay: '0s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          bottom: '25%',
          right: '20%',
          width: '120px',
          height: '120px',
          background: 'rgba(255, 0, 110, 0.1)',
          animationDelay: '4s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          top: '70%',
          left: '25%',
          width: '90px',
          height: '90px',
          background: 'rgba(131, 56, 236, 0.1)',
          animationDelay: '7s'
        }}
      />

      {/* Network Status & Offline Message */}
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
            33% { transform: translateY(-25px) rotate(3deg); }
            66% { transform: translateY(15px) rotate(-3deg); }
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

          input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          /* PWA-specific styles */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Prevent zoom on iOS */
          input[type="email"],
          input[type="password"],
          select {
            font-size: 16px !important;
          }

          /* Better focus indicators */
          button:focus-visible,
          input:focus-visible,
          select:focus-visible {
            outline: 2px solid #00f5ff;
            outline-offset: 2px;
          }

          /* PWA-style scrolling */
          * {
            -webkit-overflow-scrolling: touch;
          }

          /* Centering container */
          .register-container {
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
            .register-container {
              padding: 0 1rem !important;
            }
          }

          /* PWA display modes */
          @media (display-mode: standalone) {
            .register-container {
              padding-top: env(safe-area-inset-top, 20px);
            }
          }

          /* Accessibility */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          @media (prefers-contrast: high) {
            .form-container {
              border: 2px solid white !important;
            }
            input, select {
              border: 2px solid rgba(255, 255, 255, 0.5) !important;
            }
          }
        `}
      </style>

      {/* Centered register form */}
      <div className="register-container">
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
            <h1 style={styles.title}>{t('register_title')}</h1>
            <p style={styles.subtitle}>{t('join_divido')}</p>
          </div>

          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder={t('email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder={t('confirm_password_placeholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              style={styles.select}
              onFocus={(e) => {
                Object.assign(e.target.style, styles.inputFocus);
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, styles.select);
              }}
            >
              <option value="en" style={styles.selectOption}>
                {t('language_english')}
              </option>
              <option value="tr" style={styles.selectOption}>
                {t('language_turkish')}
              </option>
            </select>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            onClick={handleRegister}
            style={{
              ...styles.button,
              ...(!isFormValid || loading || !isOnline
                ? styles.buttonDisabled
                : {})
            }}
            disabled={!isFormValid || loading || !isOnline}
            onMouseEnter={(e) => {
              if (!loading && isFormValid && isOnline) {
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
                {t('register_loading')}
              </span>
            ) : !isOnline ? (
              `📡 ${t('offline_button')}`
            ) : (
              t('register_button')
            )}
          </button>

          {/* Login Link */}
          <div style={styles.loginLink}>
            <div style={styles.loginLinkText}>{t('already_have_account')}</div>
            <button
              style={styles.loginLinkButton}
              onClick={() => (window.location.href = '/login')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)';
                e.currentTarget.style.borderColor = '#00f5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.3)';
              }}
            >
              {t('sign_in_instead')}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Register;
