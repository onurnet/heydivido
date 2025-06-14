import React from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { handlePendingInvitation } from '../utils/inviteHandler'; // ✅ YENİ IMPORT

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

  // ✅ YENİ STATE'LER - Invitation için
  const [invitationInfo, setInvitationInfo] = React.useState<any>(null);
  const [loadingInvite, setLoadingInvite] = React.useState(true);

  // ✅ YENİ STATE - Custom dropdown için
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Small delay function
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // ✅ YENİ FONKSİYON - Davet bilgisini yükle (sadece görüntüleme için)
  const loadInvitationPreview = async () => {
    try {
      const pendingToken = localStorage.getItem('pendingInviteToken');

      if (!pendingToken) {
        setLoadingInvite(false);
        return;
      }

      console.log('Loading invitation preview for token:', pendingToken);

      // Token ile etkinlik bilgisini al (authentication olmadan)
      const { data: invitation, error } = await supabase
        .from('event_invitations')
        .select(
          `
          event:events(name, description, place_city, place_country)
        `
        )
        .eq('token', pendingToken)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!error && invitation) {
        console.log('Invitation found:', invitation.event);
        setInvitationInfo(invitation.event);
      }
    } catch (error) {
      console.error('Error loading invitation preview:', error);
    } finally {
      setLoadingInvite(false);
    }
  };

  // ✅ YENİ FONKSİYON - Register başarılı sonrası davet kontrolü
  const handleRegisterSuccess = async () => {
    try {
      console.log('Register successful, checking for pending invitations...');

      // Bekleyen davetiye kontrolü
      const redirectUrl = await handlePendingInvitation(t);

      if (redirectUrl) {
        console.log('Redirecting to event:', redirectUrl);
        // Davet varsa event sayfasına yönlendir
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000); // Register'da biraz daha uzun bekleme
      } else {
        console.log('No pending invitation, redirecting to login');
        // Normal register flow'u - login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } catch (error) {
      console.error('Error in register success handler:', error);
      // Hata durumunda da login'e yönlendir
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

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

  // ✅ YENİ useEffect - Component mount'ta davet bilgisini yükle
  React.useEffect(() => {
    loadInvitationPreview();
  }, []);

  // ✅ YENİ useEffect - Supabase auth state change listener (email confirmation sonrası)
  React.useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in after email confirmation');
        await handleRegisterSuccess();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ YENİ useEffect - Dropdown'ı kapatmak için click outside listener
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const dropdown = document.getElementById('language-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

      // 4️⃣ Success: Change language and show success
      toast.success(t('registration_successful'));

      // Bekle, kullanıcı tostu görsün
      await sleep(1500); // 1.5 saniye bekle

      // Change app language to user's preferred language
      i18n.changeLanguage(preferredLanguage);

      // ✅ GÜNCEL - Email confirmation bekleme mesajı ve invitation bilgisi
      if (invitationInfo) {
        toast.success(t('check_email_to_join_event'));
      } else {
        toast.success(t('registration_successful_check_email'));
      }

      // Eğer instant confirmation varsa (email confirmation kapalıysa):
      // await handleRegisterSuccess();
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('registration_failed'));
    }

    setLoading(false);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  // ✅ YENİ FONKSİYON - Language seçimi
  const handleLanguageSelect = (language: string) => {
    setPreferredLanguage(language);
    setIsDropdownOpen(false);
  };

  // ✅ YENİ FONKSİYON - Language label'ı al
  const getLanguageLabel = (language: string) => {
    return language === 'en' ? t('language_english') : t('language_turkish');
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

    // ✅ YENİ STYLE - Invitation Preview Card
    invitationPreview: {
      background: 'rgba(0, 245, 255, 0.1)',
      border: '1px solid rgba(0, 245, 255, 0.2)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      textAlign: 'center' as const,
      animation: 'slideDown 0.5s ease-out'
    },

    inviteIcon: {
      fontSize: '2rem',
      marginBottom: '8px'
    },

    inviteTitle: {
      color: '#00f5ff',
      fontSize: '1.1rem',
      marginBottom: '8px',
      fontWeight: '600'
    },

    eventName: {
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: '700',
      marginBottom: '4px'
    },

    eventLocation: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.9rem',
      marginBottom: '8px'
    },

    inviteNote: {
      color: 'rgba(0, 245, 255, 0.8)',
      fontSize: '0.8rem',
      fontStyle: 'italic',
      margin: '0'
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

    // ✅ YENİ STYLES - Custom Dropdown
    dropdownContainer: {
      position: 'relative' as const,
      width: '100%'
    },

    dropdownButton: {
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
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent'
    },

    dropdownArrow: {
      width: '16px',
      height: '16px',
      color: 'rgba(255, 255, 255, 0.7)',
      transition: 'transform 0.3s ease',
      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
    },

    dropdownMenu: {
      position: 'absolute' as const,
      top: '100%',
      left: '0',
      right: '0',
      background: 'rgba(26, 26, 46, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      marginTop: '4px',
      zIndex: 1000,
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      animation: 'dropdownSlide 0.2s ease-out'
    },

    dropdownOption: {
      padding: '12px 16px',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },

    dropdownOptionLast: {
      borderBottom: 'none'
    },

    dropdownOptionHover: {
      background: 'rgba(0, 245, 255, 0.1)',
      color: '#00f5ff'
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

    // ✅ GÜNCEL STYLES - Login Link Section
    loginLink: {
      textAlign: 'center' as const,
      marginTop: '2rem',
      padding: '1.5rem 1rem 0.5rem 1rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },

    loginLinkText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '14px',
      marginBottom: '12px',
      fontWeight: '400'
    },

    loginLinkButton: {
      background: 'transparent',
      border: '1px solid rgba(0, 245, 255, 0.3)',
      borderRadius: '10px',
      padding: '12px 24px',
      color: '#00f5ff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },

    loginLinkButtonHover: {
      background: 'rgba(0, 245, 255, 0.1)',
      borderColor: '#00f5ff',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 245, 255, 0.2)'
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

          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
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

          {/* ✅ YENİ - Invitation Preview Card */}
          {invitationInfo && !loadingInvite && (
            <div style={styles.invitationPreview}>
              <div style={styles.inviteIcon}>🎉</div>
              <h3 style={styles.inviteTitle}>{t('joining_event')}</h3>
              <p style={styles.eventName}>{invitationInfo.name}</p>
              <p style={styles.eventLocation}>
                {invitationInfo.place_city}, {invitationInfo.place_country}
              </p>
              <p style={styles.inviteNote}>
                {t('after_registration_auto_join')}
              </p>
            </div>
          )}

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

          {/* ✅ YENİ - Custom Language Dropdown */}
          <div style={styles.inputGroup}>
            <div style={styles.dropdownContainer} id="language-dropdown">
              <button
                type="button"
                style={{
                  ...styles.dropdownButton,
                  ...(isDropdownOpen ? styles.inputFocus : {})
                }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{getLanguageLabel(preferredLanguage)}</span>
                <svg
                  style={styles.dropdownArrow}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div style={styles.dropdownMenu}>
                  <div
                    style={{
                      ...styles.dropdownOption,
                      ...(preferredLanguage === 'en'
                        ? {
                            background: 'rgba(0, 245, 255, 0.1)',
                            color: '#00f5ff'
                          }
                        : {})
                    }}
                    onClick={() => handleLanguageSelect('en')}
                    onMouseEnter={(e) => {
                      if (preferredLanguage !== 'en') {
                        Object.assign(
                          e.currentTarget.style,
                          styles.dropdownOptionHover
                        );
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (preferredLanguage !== 'en') {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    {t('language_english')}
                  </div>
                  <div
                    style={{
                      ...styles.dropdownOption,
                      ...styles.dropdownOptionLast,
                      ...(preferredLanguage === 'tr'
                        ? {
                            background: 'rgba(0, 245, 255, 0.1)',
                            color: '#00f5ff'
                          }
                        : {})
                    }}
                    onClick={() => handleLanguageSelect('tr')}
                    onMouseEnter={(e) => {
                      if (preferredLanguage !== 'tr') {
                        Object.assign(
                          e.currentTarget.style,
                          styles.dropdownOptionHover
                        );
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (preferredLanguage !== 'tr') {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    {t('language_turkish')}
                  </div>
                </div>
              )}
            </div>
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

          {/* ✅ GÜNCEL - Login Link Section */}
          <div style={styles.loginLink}>
            <div style={styles.loginLinkText}>{t('already_have_account')}</div>
            <button
              style={styles.loginLinkButton}
              onClick={() => (window.location.href = '/login')}
              onMouseEnter={(e) => {
                Object.assign(
                  e.currentTarget.style,
                  styles.loginLinkButtonHover
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>→</span>
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
