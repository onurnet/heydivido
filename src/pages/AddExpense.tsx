import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import GeoapifyAutocomplete from '../components/GeoapifyAutocomplete/GeoapifyAutocomplete';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';

// Dummy users (bu ileride event users olacak)
const dummyUsers = [
  { id: '1', name: 'Ali Veli' },
  { id: '2', name: 'Ayşe Yılmaz' },
  { id: '3', name: 'John Doe' }
];

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
      padding: '14px',
      minHeight: '44px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
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
      borderRadius: '10px',
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

const AddExpense: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  const [isPlaceExpense, setIsPlaceExpense] = useState(true);

  const [selectedPOI, setSelectedPOI] = useState<{
    name: string;
    country: string;
    city: string;
    district?: string;
    street?: string;
    lat?: number;
    lon?: number;
    placeId?: string;
  } | null>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');

  const [paidByUserId, setPaidByUserId] = useState(dummyUsers[0].id);
  const [participants, setParticipants] = useState<string[]>([
    dummyUsers[0].id
  ]);

  const [splitMethod, setSplitMethod] = useState<'equal' | 'manual'>('equal');

  const [saving, setSaving] = useState(false);

  const currencies = ['EUR', 'USD', 'GBP', 'TRY'];

  const currencyOptions: DropdownOption[] = currencies.map((curr) => ({
    value: curr,
    label: curr
  }));

  const userOptions: DropdownOption[] = dummyUsers.map((user) => ({
    value: user.id,
    label: user.name
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Amount formatting functions
  const formatNumber = (value: number | string): string => {
    if (value === '' || value === null || value === undefined) return '';

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';

    // Get user's locale for formatting
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const parseFormattedNumber = (formattedValue: string): number | '' => {
    if (!formattedValue) return '';

    // Remove thousand separators and handle decimal separators
    let cleanValue = formattedValue;

    // For Turkish locale: remove dots (thousand sep) and replace comma with dot
    if (i18n.language === 'tr') {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      // For English locale: remove commas (thousand sep)
      cleanValue = cleanValue.replace(/,/g, '');
    }

    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? '' : parsed;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numbers, dots, and commas during typing
    const sanitizedValue = inputValue.replace(/[^\d.,]/g, '');

    // Parse the value to number
    const numericValue = parseFormattedNumber(sanitizedValue);

    setAmount(numericValue);
    setDisplayAmount(sanitizedValue);
  };

  const handleAmountBlur = () => {
    if (amount !== '') {
      setDisplayAmount(formatNumber(amount));
    }
  };

  const handleAmountFocus = () => {
    if (amount !== '') {
      // Show raw number for editing
      setDisplayAmount(amount.toString());
    }
  };

  const handleSave = async () => {
    if (!eventId) {
      toast.error(t('event_not_found'));
      return;
    }

    if (
      !description ||
      !amount ||
      amount === '' ||
      !currency ||
      !paidByUserId ||
      participants.length === 0
    ) {
      toast.error(t('fill_required_fields'));
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          event_id: eventId,
          description,
          amount,
          currency,
          conversion_rate_to_event_currency: 1, // şimdilik dummy
          paid_by: paidByUserId,
          place_name: selectedPOI?.name || null,
          place_id: selectedPOI?.placeId || null,
          place_lat: selectedPOI?.lat || null,
          place_lon: selectedPOI?.lon || null,
          place_country: selectedPOI?.country || null,
          place_city: selectedPOI?.city || null,
          category: isPlaceExpense ? 'place' : 'general'
        }
      ]);

      if (error) {
        console.error('Error inserting expense:', error);
        toast.error(t('failed_create_expense'));
        return;
      }

      toast.success(t('expense_created_successfully'));
      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(t('failed_create_expense'));
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding:
          'env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) 100px env(safe-area-inset-left, 20px)'
      },

      floatingElement: {
        position: 'absolute' as const,
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 12s ease-in-out infinite',
        pointerEvents: 'none' as const
      },

      addExpenseContainer: {
        width: '100%',
        maxWidth: '500px',
        position: 'relative' as const,
        zIndex: 2
      },

      formContainer: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        position: 'relative' as const
      },

      header: {
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        textAlign: 'center' as const,
        position: 'relative' as const
      },

      backButton: {
        position: 'absolute' as const,
        top: '16px',
        left: '16px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#e2e8f0',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '8px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      content: {
        padding: '24px'
      },

      formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', // ✅ Eşit boyutlar için 1fr 1fr
        gap: '16px',
        marginBottom: '16px'
      },

      inputGroup: {
        marginBottom: '16px'
      },

      label: {
        display: 'block',
        color: '#e2e8f0',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '6px'
      },

      input: {
        width: '100%',
        padding: '14px',
        minHeight: '44px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
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

      radioGroup: {
        display: 'flex',
        gap: '20px',
        marginBottom: '16px'
      },

      radioItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
      },

      radio: {
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        background: 'transparent',
        cursor: 'pointer',
        position: 'relative' as const,
        transition: 'all 0.3s ease'
      },

      radioChecked: {
        borderColor: '#00f5ff',
        '::after': {
          content: '""',
          position: 'absolute',
          top: '3px',
          left: '3px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#00f5ff'
        }
      },

      checkboxGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px'
      },

      checkboxItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '8px',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      },

      checkbox: {
        width: '18px',
        height: '18px',
        borderRadius: '4px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      },

      checkboxChecked: {
        borderColor: '#00f5ff',
        background: '#00f5ff'
      },

      button: {
        width: '100%',
        padding: '16px 32px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '20px',
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
        position: 'fixed' as const,
        top: 'env(safe-area-inset-top, 20px)',
        right: 'env(safe-area-inset-right, 20px)',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '6px 10px',
        display: 'flex',
        gap: '6px',
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
        minHeight: '28px',
        borderRadius: '10px',
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
        top: '12px',
        left: '12px',
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

  // Render minimal floating elements
  const FloatingElements = useMemo(
    () => (
      <>
        <div
          style={{
            ...styles.floatingElement,
            top: '15%',
            left: '10%',
            width: '150px',
            height: '150px',
            background: 'rgba(0, 245, 255, 0.08)',
            animationDelay: '0s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            bottom: '20%',
            right: '15%',
            width: '120px',
            height: '120px',
            background: 'rgba(255, 0, 110, 0.08)',
            animationDelay: '6s'
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
        
        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        /* Custom radio styling */
        .radio-checked::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00f5ff;
        }

        /* Custom checkbox styling */
        .checkbox-checked::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 2px;
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
          .add-expense-container {
            padding: 16px !important;
            max-width: 100% !important;
          }
          .form-container {
            border-radius: 16px !important;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .header {
            padding: 20px 16px !important;
          }
          .content {
            padding: 20px !important;
          }
          .title {
            font-size: 1.75rem !important;
          }
          .radio-group {
            flex-direction: column !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .language-selector {
            top: env(safe-area-inset-top, 16px) !important;
            right: env(safe-area-inset-right, 16px) !important;
            padding: 4px 8px !important;
            border-radius: 12px !important;
          }
          .language-button {
            font-size: 11px !important;
            padding: 4px 8px !important;
            min-height: 24px !important;
          }
        }

        /* Support for PWA display modes */
        @media (display-mode: standalone) {
          .container {
            padding-top: env(safe-area-inset-top, 0) !important;
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

      <div style={styles.addExpenseContainer} className="add-expense-container">
        <div style={styles.formContainer} className="form-container">
          <div
            style={styles.networkIndicator}
            title={isOnline ? 'Online' : 'Offline'}
          ></div>

          <div style={styles.header} className="header">
            <button
              style={styles.backButton}
              onClick={() => navigate(`/events/${eventId}`)}
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
            <h1 style={styles.title} className="title">
              {t('add_expense_button')}
            </h1>
          </div>

          <div style={styles.content} className="content">
            {/* Expense Type Selection */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('expense_type_label')}</label>
              <div style={styles.radioGroup} className="radio-group">
                <div
                  style={styles.radioItem}
                  onClick={() => setIsPlaceExpense(true)}
                >
                  <div
                    style={{
                      ...styles.radio,
                      ...(isPlaceExpense ? { borderColor: '#00f5ff' } : {})
                    }}
                    className={isPlaceExpense ? 'radio-checked' : ''}
                  ></div>
                  <span>{t('place_expense')}</span>
                </div>
                <div
                  style={styles.radioItem}
                  onClick={() => setIsPlaceExpense(false)}
                >
                  <div
                    style={{
                      ...styles.radio,
                      ...(!isPlaceExpense ? { borderColor: '#00f5ff' } : {})
                    }}
                    className={!isPlaceExpense ? 'radio-checked' : ''}
                  ></div>
                  <span>{t('general_expense')}</span>
                </div>
              </div>
            </div>

            {/* POI Selection */}
            {isPlaceExpense && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('select_place')}</label>
                <GeoapifyAutocomplete
                  type="poi"
                  value={selectedPOI?.name || ''}
                  onSelect={(placeId, placeName, extraData) => {
                    setSelectedPOI({
                      name: placeName,
                      placeId: placeId,
                      country: extraData.country,
                      city: extraData.city,
                      district: extraData.district,
                      street: extraData.street,
                      lat: extraData.lat,
                      lon: extraData.lon
                    });
                  }}
                />
              </div>
            )}

            {/* Description */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('event_description_label')}</label>
              <input
                style={styles.input}
                type="text"
                placeholder={t('event_description_label')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) =>
                  Object.assign(e.target.style, styles.inputFocus)
                }
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>

            {/* Amount & Currency */}
            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('amount_label')}</label>
                <input
                  style={styles.input}
                  type="text" // ✅ Text olarak değiştirildi formatting için
                  placeholder={i18n.language === 'tr' ? '0,00' : '0.00'}
                  value={displayAmount}
                  onChange={handleAmountChange}
                  onFocus={(e) => {
                    Object.assign(e.target.style, styles.inputFocus);
                    handleAmountFocus();
                  }}
                  onBlur={(e) => {
                    Object.assign(e.target.style, styles.input);
                    handleAmountBlur();
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {t('default_currency_label')}
                </label>
                <CustomDropdown
                  options={currencyOptions}
                  value={currency}
                  onChange={setCurrency}
                  placeholder={t('default_currency_label')}
                />
              </div>
            </div>

            {/* Paid By */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('paid_by_label')}</label>
              <CustomDropdown
                options={userOptions}
                value={paidByUserId}
                onChange={setPaidByUserId}
                placeholder={t('paid_by_label')}
              />
            </div>

            {/* Split Method */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('split_method_label')}</label>
              <div style={styles.radioGroup} className="radio-group">
                <div
                  style={styles.radioItem}
                  onClick={() => setSplitMethod('equal')}
                >
                  <div
                    style={{
                      ...styles.radio,
                      ...(splitMethod === 'equal'
                        ? { borderColor: '#00f5ff' }
                        : {})
                    }}
                    className={splitMethod === 'equal' ? 'radio-checked' : ''}
                  ></div>
                  <span>{t('split_equal')}</span>
                </div>
                <div
                  style={styles.radioItem}
                  onClick={() => setSplitMethod('manual')}
                >
                  <div
                    style={{
                      ...styles.radio,
                      ...(splitMethod === 'manual'
                        ? { borderColor: '#00f5ff' }
                        : {})
                    }}
                    className={splitMethod === 'manual' ? 'radio-checked' : ''}
                  ></div>
                  <span>{t('split_manual')}</span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('participants_label')}</label>
              <div style={styles.checkboxGroup}>
                {dummyUsers.map((user) => (
                  <div
                    key={user.id}
                    style={styles.checkboxItem}
                    onClick={() => {
                      if (participants.includes(user.id)) {
                        setParticipants(
                          participants.filter((id) => id !== user.id)
                        );
                      } else {
                        setParticipants([...participants, user.id]);
                      }
                    }}
                  >
                    <div
                      style={{
                        ...styles.checkbox,
                        ...(participants.includes(user.id)
                          ? styles.checkboxChecked
                          : {})
                      }}
                      className={
                        participants.includes(user.id) ? 'checkbox-checked' : ''
                      }
                    ></div>
                    <span>{user.name}</span>
                  </div>
                ))}
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
              {saving ? t('saving_expense') : t('save_expense_button')}
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AddExpense;
