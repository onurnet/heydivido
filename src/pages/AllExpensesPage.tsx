import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Event {
  id: string;
  name: string;
  status: string;
  default_currency: string;
}

interface ExpenseWithDetails {
  id: string;
  event_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  expense_date: string;
  category: string;
  created_at: string;
  users: User;
  events: Event;
}

// Helper function to get user display name
const getUserDisplayName = (
  user: User | null,
  t: (key: string) => string
): string => {
  if (!user) return t('unknown_user');

  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  } else if (user.first_name) {
    return user.first_name;
  } else if (user.last_name) {
    return user.last_name;
  } else if (user.email) {
    return user.email;
  } else {
    return t('unknown_user');
  }
};

const ExpenseCard: React.FC<{ expense: ExpenseWithDetails }> = ({
  expense
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isPassive = expense.events.status !== 'active';

  const styles = {
    card: {
      background: isPassive
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: isPassive
        ? '1px solid rgba(255, 255, 255, 0.05)'
        : '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      opacity: isPassive ? 0.5 : 1
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px'
    },
    expenseDescription: {
      color: isPassive ? 'rgba(255, 255, 255, 0.4)' : 'white',
      fontSize: '15px',
      fontWeight: '600',
      flex: 1,
      marginRight: '12px'
    },
    expenseAmount: {
      color: isPassive ? 'rgba(0, 245, 255, 0.4)' : '#00f5ff',
      fontSize: '16px',
      fontWeight: '700',
      textAlign: 'right' as const
    },
    eventName: {
      color: isPassive
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(255, 255, 255, 0.6)',
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    statusBadge: {
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: isPassive
        ? 'rgba(255, 107, 107, 0.2)'
        : 'rgba(76, 175, 80, 0.2)',
      color: isPassive ? 'rgba(255, 107, 107, 0.8)' : 'rgba(76, 175, 80, 0.8)',
      fontWeight: '600'
    },
    expenseDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      color: isPassive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)'
    },
    expensePaidBy: {
      color: isPassive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.8)'
    },
    expenseDate: {
      color: isPassive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'
    }
  };

  return (
    <div
      style={styles.card}
      onClick={() =>
        navigate(`/events/${expense.event_id}/expenses/${expense.id}/edit`)
      }
      onMouseEnter={(e) => {
        if (!isPassive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isPassive
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={styles.eventName}>
        <span>📋</span>
        <span>{expense.events.name}</span>
        <span style={styles.statusBadge}>
          {isPassive ? t('passive') : t('active')}
        </span>
      </div>
      <div style={styles.cardHeader}>
        <div style={styles.expenseDescription}>{expense.description}</div>
        <div style={styles.expenseAmount}>
          {expense.amount.toFixed(2)} {expense.currency}
        </div>
      </div>
      <div style={styles.expenseDetails}>
        <span style={styles.expensePaidBy}>
          {t('paid_by_label')}: {getUserDisplayName(expense.users, t)}
        </span>
        <span style={styles.expenseDate}>
          {new Date(expense.expense_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const AllExpensesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

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
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        // Get current user to filter only their expenses
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
          toast.error(t('authentication_error'));
          setLoading(false);
          return;
        }

        // Fetch expenses with event and user details, limited to last 20
        // Exclude expenses from deleted events
        const { data, error } = await supabase
          .from('expenses')
          .select(
            `
            *,
            users!paid_by(id, auth_user_id, first_name, last_name, email),
            events!event_id(id, name, status, default_currency)
          `
          )
          .neq('events.status', 'deleted')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching expenses:', error);
          toast.error(t('failed_load_expenses'));
        } else {
          setExpenses(data as ExpenseWithDetails[]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error(t('unexpected_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [t]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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
          'env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 120px) env(safe-area-inset-left, 20px)',
        paddingBottom: '120px' // Extra padding for BottomNavigation
      },

      floatingElement: {
        position: 'absolute' as const,
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 12s ease-in-out infinite',
        pointerEvents: 'none' as const
      },

      expensesContainer: {
        width: '100%',
        maxWidth: '600px',
        position: 'relative' as const,
        zIndex: 2
      },

      header: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '20px 24px',
        marginBottom: '20px',
        textAlign: 'center' as const,
        position: 'relative' as const
      },

      title: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: 'white',
        margin: '0',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      subtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        marginTop: '8px',
        margin: '8px 0 0 0'
      },

      warningCard: {
        background: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid rgba(255, 193, 7, 0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },

      warningIcon: {
        fontSize: '16px'
      },

      warningText: {
        color: 'rgba(255, 193, 7, 0.9)',
        fontSize: '13px',
        fontWeight: '500',
        margin: '0'
      },

      expensesCard: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '24px'
      },

      emptyState: {
        textAlign: 'center' as const,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '15px',
        padding: '40px 20px'
      },

      emptyIcon: {
        fontSize: '3rem',
        marginBottom: '16px',
        opacity: 0.5
      },

      loading: {
        textAlign: 'center' as const,
        color: '#00f5ff',
        fontSize: '18px',
        padding: '60px 20px'
      },

      loadingSpinner: {
        width: '32px',
        height: '32px',
        border: '3px solid rgba(0, 245, 255, 0.3)',
        borderTop: '3px solid #00f5ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px auto'
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
        right: '12px',
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .expenses-container {
            padding: 16px 16px 120px 16px !important;
            max-width: 100% !important;
          }
          .header {
            padding: 16px 20px !important;
          }
          .expenses-card {
            padding: 20px !important;
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
          .header,
          .expenses-card {
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
          }
        }
        `}
      </style>
    ),
    []
  );

  if (loading) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        {FloatingElements}
        {LanguageSelector}
        <div style={styles.expensesContainer}>
          <div style={styles.loading}>
            <div style={styles.loadingSpinner}></div>
            {t('loading_expenses')}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {GlobalStyles}
      {FloatingElements}

      {showOfflineMessage && (
        <div style={styles.offlineMessage}>📡 {t('offline_message')}</div>
      )}

      {LanguageSelector}

      <div style={styles.expensesContainer} className="expenses-container">
        <div
          style={styles.networkIndicator}
          title={isOnline ? 'Online' : 'Offline'}
        ></div>

        {/* Header */}
        <div style={styles.header} className="header">
          <h1 style={styles.title}>{t('all_expenses_title')}</h1>
          <p style={styles.subtitle}>
            {expenses.length} {t('expenses_found')}
          </p>
        </div>

        {/* Warning about 20 expense limit */}
        <div style={styles.warningCard}>
          <span style={styles.warningIcon}>ℹ️</span>
          <p style={styles.warningText}>{t('showing_last_20_expenses')}</p>
        </div>

        {/* Expenses Card */}
        <div style={styles.expensesCard} className="expenses-card">
          {expenses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💳</div>
              <div>{t('no_expenses_found')}</div>
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default AllExpensesPage;
