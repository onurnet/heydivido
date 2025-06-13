import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // ✅ useNavigate import'u eklendi
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';
import GeoapifyAutocomplete from '../components/GeoapifyAutocomplete/GeoapifyAutocomplete';

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

const AddEvent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // ✅ useNavigate hook'u tanımlandı

  const [name, setName] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [description, setDescription] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('EUR');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedDurationDays, setPlannedDurationDays] = useState<number | ''>(
    ''
  );

  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  const currencies = [
    { code: 'EUR', name: 'Euro (EUR)' },
    { code: 'USD', name: 'US Dollar (USD)' },
    { code: 'GBP', name: 'British Pound (GBP)' },
    { code: 'TRY', name: 'Turkish Lira (TRY)' }
  ];

  const eventCategories = [
    { value: 'long_vacation', label: t('event_category_option_long_vacation') },
    { value: 'short_trip', label: t('event_category_option_short_trip') },
    {
      value: 'dining_friends',
      label: t('event_category_option_dining_friends')
    },
    { value: 'weekend_fun', label: t('event_category_option_weekend_fun') },
    {
      value: 'special_occasion',
      label: t('event_category_option_special_occasion')
    },
    { value: 'other', label: t('event_category_option_other') }
  ];

  const currencyOptions: DropdownOption[] = currencies.map((currency) => ({
    value: currency.code,
    label: currency.name
  }));

  const categoryOptions: DropdownOption[] = eventCategories;

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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // ✅ Güncellenmiş handleSave fonksiyonu - Event participants ile birlikte
  const handleSave = async () => {
    if (
      !name ||
      !eventCategory ||
      !description ||
      !defaultCurrency ||
      !country ||
      !city
    ) {
      toast.error(t('fill_required_fields'));
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error(t('user_not_authenticated'));
        return;
      }

      // ✅ 1. Önce etkinliği oluştur
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([
          {
            name,
            category: eventCategory,
            description,
            default_currency: defaultCurrency,
            place_country: country,
            place_city: city,
            planned_start_date: plannedStartDate || null,
            planned_duration_days: plannedDurationDays || null,
            created_by: user.id,
            status: 'active'
          }
        ])
        .select('id')
        .single();

      if (eventError) {
        console.error('Error inserting event:', eventError);
        toast.error(t('failed_create_event'));
        return;
      }

      // ✅ 2. Etkinlik oluşturucusunu katılımcı olarak ekle
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert([
          {
            event_id: eventData.id,
            user_id: user.id,
            role: 'admin', // Etkinlik oluşturucu admin rolünde
            status: 'active',
            joined_at: new Date().toISOString()
          }
        ]);

      if (participantError) {
        console.error('Error adding participant:', participantError);

        // ✅ Hata durumunda oluşturulan etkinliği sil (rollback)
        await supabase.from('events').delete().eq('id', eventData.id);

        toast.error(t('failed_create_event'));
        return;
      }

      // ✅ Her şey başarılı - başarılı mesajı göster
      toast.success(t('event_created_successfully'));

      // ✅ Yeni oluşturulan event'in detay sayfasına yönlendir
      navigate(`/events/${eventData.id}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(t('failed_create_event'));
    } finally {
      setSaving(false);
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

      addEventContainer: {
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

      textarea: {
        width: '100%',
        padding: '16px',
        minHeight: '100px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        fontSize: '16px',
        color: 'white',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        transition: 'all 0.3s ease',
        outline: 'none',
        boxSizing: 'border-box' as const,
        resize: 'vertical' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      inputFocus: {
        borderColor: '#00f5ff',
        boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.08)'
      },

      button: {
        width: '100%',
        padding: '16px 32px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '24px',
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

  // Render floating elements
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

  // Language selector
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

  // Global styles
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
        
        input::placeholder,
        textarea::placeholder {
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
        input[type="tel"],
        input[type="date"],
        input[type="number"],
        textarea {
          font-size: 16px !important;
        }

        /* Better focus indicators */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
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
          .add-event-container {
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
        }

        /* Support for PWA display modes */
        @media (display-mode: standalone) {
          .add-event-container {
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
          input, textarea {
            border: 2px solid rgba(255, 255, 255, 0.5) !important;
          }
        }
      `}
      </style>
    ),
    []
  );

  return (
    <div style={styles.container}>
      {GlobalStyles}
      {FloatingElements}

      {showOfflineMessage && (
        <div style={styles.offlineMessage}>📡 {t('offline_message')}</div>
      )}

      {LanguageSelector}

      <div style={styles.addEventContainer} className="add-event-container">
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
            <h1 style={styles.title}>{t('add_new_event')}</h1>
          </div>

          <div style={styles.content}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('event_name_label')}</label>
              <input
                style={styles.input}
                type="text"
                placeholder={t('event_name_label')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) =>
                  Object.assign(e.target.style, styles.inputFocus)
                }
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('event_category_label')}</label>
              <CustomDropdown
                options={categoryOptions}
                value={eventCategory}
                onChange={setEventCategory}
                placeholder={t('event_category_label')}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('event_description_label')}</label>
              <textarea
                style={styles.textarea}
                placeholder={t('event_description_label')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) =>
                  Object.assign(e.target.style, styles.inputFocus)
                }
                onBlur={(e) => Object.assign(e.target.style, styles.textarea)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('default_currency_label')}</label>
              <CustomDropdown
                options={currencyOptions}
                value={defaultCurrency}
                onChange={setDefaultCurrency}
                placeholder={t('default_currency_label')}
              />
            </div>

            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('country_label')}</label>
                <GeoapifyAutocomplete
                  type="country"
                  value={country}
                  onSelect={(countryCode, countryName) => {
                    setCountry(countryCode);
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('city_label')}</label>
                <GeoapifyAutocomplete
                  type="city"
                  countryCode={country}
                  value={city}
                  onSelect={(cityName) => {
                    setCity(cityName);
                  }}
                />
              </div>
            </div>

            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {t('event_planned_start_date_label')}
                </label>
                <input
                  style={styles.input}
                  type="date"
                  value={plannedStartDate}
                  onChange={(e) => setPlannedStartDate(e.target.value)}
                  onFocus={(e) =>
                    Object.assign(e.target.style, styles.inputFocus)
                  }
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {t('event_planned_duration_days_label')}
                </label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder={t('event_planned_duration_days_label')}
                  value={plannedDurationDays}
                  onChange={(e) =>
                    setPlannedDurationDays(
                      e.target.value ? parseInt(e.target.value, 10) : ''
                    )
                  }
                  min="1"
                  onFocus={(e) =>
                    Object.assign(e.target.style, styles.inputFocus)
                  }
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
              </div>
            </div>

            <button
              style={{
                ...styles.button,
                ...(saving ? styles.buttonDisabled : {})
              }}
              onClick={handleSave}
              disabled={saving}
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
              {saving ? t('saving_event') : t('save_event_button')}
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AddEvent;
