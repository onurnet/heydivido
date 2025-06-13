import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';
import GeoapifyAutocomplete from '../components/GeoapifyAutocomplete/GeoapifyAutocomplete';

interface UserProfile {
  divido_number: string;
  email: string;
  preferred_lang: string;
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  phone_number: string;
  iban: string;
  iban_currency: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  style
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  const dropdownStyles = {
    container: {
      position: 'relative' as const,
      width: '100%',
      ...style
    },
    trigger: {
      width: '100%',
      padding: '16px',
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
    triggerOpen: {
      borderColor: '#00f5ff',
      boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.08)'
    },
    triggerText: {
      color: selectedOption ? 'white' : 'rgba(255, 255, 255, 0.4)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    arrow: {
      marginLeft: '8px',
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.7)',
      transition: 'transform 0.3s ease',
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
    },
    dropdown: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: 'rgba(26, 26, 46, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      marginTop: '4px',
      maxHeight: '200px',
      overflowY: 'auto' as const,
      zIndex: 1000,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden',
      transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    option: {
      padding: '12px 16px',
      fontSize: '16px',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    optionHover: {
      background: 'rgba(0, 245, 255, 0.1)',
      color: '#00f5ff'
    },
    optionSelected: {
      background: 'rgba(0, 245, 255, 0.2)',
      color: '#00f5ff',
      fontWeight: '600'
    }
  };

  return (
    <div ref={dropdownRef} style={dropdownStyles.container}>
      <div
        style={{
          ...dropdownStyles.trigger,
          ...(isOpen ? dropdownStyles.triggerOpen : {})
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={dropdownStyles.triggerText}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={dropdownStyles.arrow}>▼</span>
      </div>

      <div style={dropdownStyles.dropdown}>
        {options.map((option) => (
          <div
            key={option.value}
            style={{
              ...dropdownStyles.option,
              ...(value === option.value ? dropdownStyles.optionSelected : {})
            }}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            onMouseEnter={(e) => {
              if (value !== option.value) {
                Object.assign(
                  e.currentTarget.style,
                  dropdownStyles.optionHover
                );
              }
            }}
            onMouseLeave={(e) => {
              if (value !== option.value) {
                Object.assign(e.currentTarget.style, dropdownStyles.option);
              }
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const currencies = [
    { code: 'EUR', name: 'Euro (EUR)' },
    { code: 'USD', name: 'US Dollar (USD)' },
    { code: 'GBP', name: 'British Pound (GBP)' },
    { code: 'TRY', name: 'Turkish Lira (TRY)' }
  ];

  const languageOptions: DropdownOption[] = [
    { value: 'en', label: t('language_english') },
    { value: 'tr', label: t('language_turkish') }
  ];

  const currencyOptions: DropdownOption[] = currencies.map((currency) => ({
    value: currency.code,
    label: currency.name
  }));

  // PWA: Network status monitoring
  useEffect(() => {
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

  useEffect(() => {
    loadProfile();
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const loadProfile = async () => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      console.log('DEBUG: FULL SESSION:', sessionData);

      const userId = sessionData?.session?.user?.id;
      console.log('DEBUG: SESSION USER ID:', userId);

      if (!userId) {
        setError(t('user_not_authenticated'));
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      console.log('DEBUG: PROFILE DATA:', data);
      console.log('DEBUG: PROFILE ERROR:', error);

      if (error) {
        setError(t('failed_load_profile'));
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('DEBUG: LOAD PROFILE ERROR:', err);
      setError(t('failed_load_profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error('Logout failed');
        return;
      }

      toast.success(t('logout_button'));

      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setError(t('user_not_authenticated'));
        return;
      }

      // Update user profile in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: profile.email,
          preferred_lang: profile.preferred_lang,
          first_name: profile.first_name,
          last_name: profile.last_name,
          country: profile.country,
          city: profile.city,
          phone_number: profile.phone_number,
          iban: profile.iban,
          iban_currency: profile.iban_currency
        })
        .eq('auth_user_id', user.id);

      if (updateError) {
        setError(t('failed_update_profile'));
        return;
      }

      // Update password if provided
      if (newPassword.trim()) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) {
          setError(t('failed_update_password'));
          return;
        }
      }

      // Update language preference
      i18n.changeLanguage(profile.preferred_lang);

      toast.success(t('profile_updated'));
      setNewPassword('');
    } catch (err) {
      setError(t('failed_update_profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    const confirmDelete = window.confirm(t('confirm_delete_account'));
    if (!confirmDelete) return;

    setDeleting(true);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];
      const deletedEmail = `deleted_${timestamp}_${profile.email}`;

      const { error } = await supabase
        .from('users')
        .update({ email: deletedEmail })
        .eq('auth_user_id', user.id);

      if (error) {
        setError(t('failed_delete_account'));
        return;
      }

      toast.success(t('account_deleted'));
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(t('failed_delete_account'));
    } finally {
      setDeleting(false);
    }
  };

  // Optimize styles with useMemo to prevent re-calculation
  const styles = useMemo(
    () => ({
      container: {
        minHeight: '100vh',
        minHeight: '100dvh',
        width: '100%',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        padding:
          'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) 100px env(safe-area-inset-left, 0px)'
      },

      floatingElement: {
        position: 'absolute' as const,
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite'
      },

      profileContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        minHeight: 'calc(100vh - 100px)',
        padding: 'clamp(20px, 5vh, 40px) clamp(16px, 4vw, 32px)',
        paddingTop: 'clamp(40px, 8vh, 80px)'
      },

      formContainer: {
        background: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '600px',
        position: 'relative' as const,
        zIndex: 2,
        overflow: 'hidden'
      },

      header: {
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '32px',
        textAlign: 'center' as const,
        position: 'relative' as const
      },

      backButton: {
        position: 'absolute' as const,
        top: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#e2e8f0',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'white',
        marginBottom: '16px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      dividoNumber: {
        background: 'rgba(0, 245, 255, 0.1)',
        border: '1px solid rgba(0, 245, 255, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '20px',
        textAlign: 'center' as const
      },

      dividoLabel: {
        color: '#00f5ff',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '4px'
      },

      dividoValue: {
        color: 'white',
        fontSize: '20px',
        fontWeight: '700',
        fontFamily: 'Monaco, monospace'
      },

      content: {
        padding: '32px'
      },

      formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      },

      inputGroup: {
        marginBottom: '24px'
      },

      label: {
        display: 'block',
        color: '#e2e8f0',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '8px'
      },

      input: {
        width: '100%',
        padding: '16px',
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

      buttonContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: '20px',
        width: '100%'
      },

      button: {
        width: '100%',
        padding: '16px 20px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '48px',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent',
        WebkitAppearance: 'none' as const
      },

      logoutButton: {
        width: '100%',
        padding: '16px 20px',
        background: 'linear-gradient(45deg, #6b7280, #9ca3af)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '48px',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent',
        WebkitAppearance: 'none' as const
      },

      deleteButton: {
        width: '100%',
        padding: '16px 20px',
        background: 'linear-gradient(45deg, #ff006e, #ff4444)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '48px',
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

      logoutButtonHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 30px rgba(107, 114, 128, 0.4)'
      },

      deleteButtonHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 30px rgba(255, 0, 110, 0.4)'
      },

      error: {
        color: '#ff006e',
        fontSize: '14px',
        marginBottom: '16px',
        padding: '12px',
        background: 'rgba(255, 0, 110, 0.1)',
        border: '1px solid rgba(255, 0, 110, 0.2)',
        borderRadius: '8px',
        textAlign: 'center' as const
      },

      loading: {
        textAlign: 'center' as const,
        color: '#00f5ff',
        fontSize: '18px',
        padding: '60px 20px',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
        top: '15px',
        left: '15px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: isOnline ? '#4CAF50' : '#f44336',
        boxShadow: `0 0 10px ${isOnline ? '#4CAF50' : '#f44336'}`,
        zIndex: 3
      }
    }),
    [isOnline]
  );

  // Render floating elements - same for all states
  const FloatingElements = useMemo(
    () => (
      <>
        <div
          style={{
            ...styles.floatingElement,
            top: '10%',
            left: '15%',
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
            animationDelay: '4s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            top: '60%',
            left: '10%',
            width: '120px',
            height: '120px',
            background: 'rgba(131, 56, 236, 0.1)',
            animationDelay: '7s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            top: '30%',
            right: '25%',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 193, 7, 0.1)',
            animationDelay: '2s'
          }}
        />
      </>
    ),
    [styles.floatingElement]
  );

  // Language selector - same for all states
  const LanguageSelector = useMemo(
    () => (
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
    ),
    [
      i18n.language,
      styles.languageSelector,
      styles.languageButton,
      styles.languageButtonActive
    ]
  );

  // Common CSS - extracted to prevent re-renders
  const GlobalStyles = useMemo(
    () => (
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
        input[type="text"],
        input[type="tel"] {
          font-size: 16px !important;
        }

        /* Better focus indicators */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid #00f5ff;
          outline-offset: 2px;
        }

        /* PWA-style scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-container {
            padding: 0 1rem !important;
            padding-top: 2rem !important;
          }
          .form-container {
            margin: 0.5rem !important;
            border-radius: 20px !important;
          }
          .language-selector {
            top: env(safe-area-inset-top, 20px) !important;
            right: env(safe-area-inset-right, 20px) !important;
          }
          .button-container {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        /* Support for PWA display modes */
        @media (display-mode: standalone) {
          .profile-container {
            padding-top: calc(env(safe-area-inset-top, 20px) + 40px);
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
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
          }
          input {
            border: 2px solid rgba(255, 255, 255, 0.5) !important;
          }
        }
      `}
      </style>
    ),
    []
  );

  // Loading state - identical structure to loaded state
  if (loading) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        {FloatingElements}
        {showOfflineMessage && (
          <div style={styles.offlineMessage}>📡 {t('offline_message')}</div>
        )}
        {LanguageSelector}

        <div style={styles.profileContainer} className="profile-container">
          <div style={styles.formContainer} className="form-container">
            <div
              style={styles.networkIndicator}
              title={isOnline ? 'Online' : 'Offline'}
            ></div>

            <div style={styles.header}>
              <h1 style={styles.title}>{t('profile_title')}</h1>
            </div>

            <div style={styles.content}>
              <div style={styles.loading}>{t('loading_profile')}</div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Error state - identical structure to loaded state
  if (!profile) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        {FloatingElements}
        {showOfflineMessage && (
          <div style={styles.offlineMessage}>📡 {t('offline_message')}</div>
        )}
        {LanguageSelector}

        <div style={styles.profileContainer} className="profile-container">
          <div style={styles.formContainer} className="form-container">
            <div
              style={styles.networkIndicator}
              title={isOnline ? 'Online' : 'Offline'}
            ></div>

            <div style={styles.header}>
              <h1 style={styles.title}>{t('profile_title')}</h1>
            </div>

            <div style={styles.content}>
              <div
                style={{
                  ...styles.error,
                  textAlign: 'center' as const,
                  padding: '60px 20px',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('failed_load_profile')}
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Main component render
  return (
    <div style={styles.container}>
      {GlobalStyles}
      {FloatingElements}

      {showOfflineMessage && (
        <div style={styles.offlineMessage}>📡 {t('offline_message')}</div>
      )}

      {LanguageSelector}

      <div style={styles.profileContainer} className="profile-container">
        <div style={styles.formContainer} className="form-container">
          <div
            style={styles.networkIndicator}
            title={isOnline ? 'Online' : 'Offline'}
          ></div>

          <div style={styles.header}>
            <button
              style={styles.backButton}
              onClick={() => window.history.back()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              ← {t('back_to_home')}
            </button>
            <h1 style={styles.title}>{t('profile_title')}</h1>
            <div style={styles.dividoNumber}>
              <div style={styles.dividoLabel}>{t('divido_number_label')}</div>
              <div style={styles.dividoValue}>{profile.divido_number}</div>
            </div>
          </div>

          <div style={styles.content}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('first_name_label')}</label>
                <input
                  style={styles.input}
                  type="text"
                  value={profile.first_name || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                  placeholder={t('first_name_placeholder')}
                  onFocus={(e) =>
                    Object.assign(e.target.style, styles.inputFocus)
                  }
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('last_name_label')}</label>
                <input
                  style={styles.input}
                  type="text"
                  value={profile.last_name || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                  placeholder={t('last_name_placeholder')}
                  onFocus={(e) =>
                    Object.assign(e.target.style, styles.inputFocus)
                  }
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('email_label')}</label>
              <input
                style={styles.input}
                type="email"
                value={profile.email || ''}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder={t('email_placeholder')}
                onFocus={(e) =>
                  Object.assign(e.target.style, styles.inputFocus)
                }
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('phone_number_label')}</label>
                <input
                  style={styles.input}
                  type="tel"
                  value={profile.phone_number || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_number: e.target.value })
                  }
                  placeholder={t('phone_placeholder')}
                  onFocus={(e) =>
                    Object.assign(e.target.style, styles.inputFocus)
                  }
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {t('preferred_language_label')}
                </label>
                <CustomDropdown
                  options={languageOptions}
                  value={profile.preferred_lang || 'en'}
                  onChange={(value) =>
                    setProfile({ ...profile, preferred_lang: value })
                  }
                  placeholder={t('preferred_language_label')}
                />
              </div>
            </div>

            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('country_label')}</label>
                <GeoapifyAutocomplete
                  type="country"
                  value={profile.country || ''}
                  onSelect={(countryCode, countryName) => {
                    setProfile({ ...profile, country: countryCode });
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('city_label')}</label>
                <GeoapifyAutocomplete
                  type="city"
                  countryCode={profile.country || ''}
                  value={profile.city || ''}
                  onSelect={(cityName) => {
                    setProfile({ ...profile, city: cityName });
                  }}
                />
              </div>
            </div>

            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>IBAN</label>
                <input
                  style={styles.input}
                  type="text"
                  value={profile.iban || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, iban: e.target.value })
                  }
                  placeholder={t('enter_your_iban')}
                  onFocus={(e) =>
                    Object.assign(e.target.style, styles.inputFocus)
                  }
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {t('iban_currency_placeholder')}
                </label>
                <CustomDropdown
                  options={currencyOptions}
                  value={profile.iban_currency || ''}
                  onChange={(value) =>
                    setProfile({ ...profile, iban_currency: value })
                  }
                  placeholder={t('iban_currency_placeholder')}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('new_password_label')}</label>
              <input
                style={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                onFocus={(e) =>
                  Object.assign(e.target.style, styles.inputFocus)
                }
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            <div style={styles.buttonContainer} className="button-container">
              <button
                style={{
                  ...styles.button,
                  ...(saving ? styles.buttonDisabled : {})
                }}
                onClick={handleSave}
                disabled={saving || loggingOut || deleting}
                onMouseEnter={(e) => {
                  if (!saving) {
                    Object.assign(e.currentTarget.style, styles.buttonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {saving ? t('updating') : t('update_button')}
              </button>

              <button
                style={{
                  ...styles.logoutButton,
                  ...(loggingOut ? styles.buttonDisabled : {})
                }}
                onClick={handleLogout}
                disabled={loggingOut || saving || deleting}
                onMouseEnter={(e) => {
                  if (!loggingOut) {
                    Object.assign(
                      e.currentTarget.style,
                      styles.logoutButtonHover
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loggingOut ? t('logging_out') : t('logout_button')}
              </button>

              <button
                style={{
                  ...styles.deleteButton,
                  ...(deleting ? styles.buttonDisabled : {})
                }}
                onClick={handleDeleteAccount}
                disabled={deleting || saving || loggingOut}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    Object.assign(
                      e.currentTarget.style,
                      styles.deleteButtonHover
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {deleting ? t('deleting') : t('delete_account_button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
