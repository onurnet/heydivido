import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface Event {
  id: string;
  name: string;
  description: string;
  category: string;
  default_currency: string;
  place_country: string;
  place_city: string;
  planned_start_date: string | null;
  planned_duration_days: number | null;
  status: string;
  created_by: string;
  created_at: string;
}

interface Expense {
  id: string;
  event_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  paid_by_name: string;
  expense_date: string;
  category: string;
  created_at: string;
}

const ExpenseCard: React.FC<{ expense: Expense }> = ({ expense }) => {
  const styles = {
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px'
    },
    expenseDescription: {
      color: 'white',
      fontSize: '15px',
      fontWeight: '600',
      flex: 1,
      marginRight: '12px'
    },
    expenseAmount: {
      color: '#00f5ff',
      fontSize: '16px',
      fontWeight: '700',
      textAlign: 'right' as const
    },
    expenseDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    expensePaidBy: {
      color: 'rgba(255, 255, 255, 0.8)'
    },
    expenseDate: {
      color: 'rgba(255, 255, 255, 0.6)'
    }
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={styles.cardHeader}>
        <div style={styles.expenseDescription}>{expense.description}</div>
        <div style={styles.expenseAmount}>
          {expense.amount.toFixed(2)} {expense.currency}
        </div>
      </div>
      <div style={styles.expenseDetails}>
        <span style={styles.expensePaidBy}>Paid by {expense.paid_by_name}</span>
        <span style={styles.expenseDate}>
          {new Date(expense.expense_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const EventDetails: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
    if (eventId) {
      loadEventDetails();
      loadExpenses();
    }
  }, [eventId]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const loadEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error loading event:', error);
        toast.error(t('failed_load_event'));
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
      toast.error(t('failed_load_event'));
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      // Önce basit query ile deneyelim
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('event_id', eventId)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error loading expenses:', error);
        return;
      }

      // Eğer expenses varsa, kullanıcı bilgilerini ayrı ayrı yükleyelim
      if (data && data.length > 0) {
        const expensesWithUsers = await Promise.all(
          data.map(async (expense) => {
            // Her expense için kullanıcı bilgisini ayrı çek
            const { data: userData } = await supabase
              .from('users')
              .select('first_name, last_name')
              .eq('auth_user_id', expense.paid_by)
              .single();

            return {
              ...expense,
              paid_by_name: userData
                ? `${userData.first_name || ''} ${
                    userData.last_name || ''
                  }`.trim()
                : 'Unknown User'
            };
          })
        );

        setExpenses(expensesWithUsers);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
      setExpenses([]);
    }
  };

  const handleEditEvent = () => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleAddExpense = () => {
    navigate(`/events/${eventId}/add-expense`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('not_specified');
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (days: number | null) => {
    if (!days) return t('not_specified');
    return `${days} ${days === 1 ? t('day') : t('days')}`;
  };

  // ✅ Düzeltilmiş handleShareEvent fonksiyonu - Basitleştirilmiş ve güvenilir
  const handleShareEvent = async () => {
    try {
      // Kullanıcı kimlik doğrulaması
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Auth error:', authError);
        toast.error(t('user_not_authenticated'));
        return;
      }

      // Kullanıcının bu etkinlikte admin rolünde olup olmadığını kontrol et
      const { data: participantData, error: participantError } = await supabase
        .from('event_participants')
        .select('role')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (participantError) {
        console.error('Participant check error:', participantError);
        toast.error(t('failed_check_permissions'));
        return;
      }

      if (!participantData || participantData.role !== 'admin') {
        toast.error(t('only_admin_can_invite'));
        return;
      }

      // Mevcut aktif davetiye var mı kontrol et
      const { data: existingInvitations, error: existingError } = await supabase
        .from('event_invitations')
        .select('token, expires_at, created_by')
        .eq('event_id', eventId)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingError) {
        console.error('Error checking existing invitations:', existingError);
        // Hata olsa bile devam et, yeni davetiye oluştur
      }

      let inviteToken;
      let isExistingToken = false;

      // Mevcut geçerli davetiye varsa onu kullan
      if (existingInvitations && existingInvitations.length > 0) {
        const existingToken = existingInvitations[0].token;
        if (
          existingToken &&
          typeof existingToken === 'string' &&
          existingToken.trim() !== ''
        ) {
          inviteToken = existingToken.trim();
          isExistingToken = true;
          console.log('Using existing invitation token:', inviteToken);
        }
      }

      // Eğer mevcut token yoksa veya geçersizse yeni oluştur
      if (!inviteToken) {
        console.log('Creating new invitation...');
        const { data: newInvitation, error: inviteError } = await supabase
          .from('event_invitations')
          .insert([
            {
              event_id: eventId,
              created_by: user.id,
              status: 'pending'
            }
          ])
          .select('token')
          .single();

        if (inviteError) {
          console.error('Error creating invitation:', inviteError);
          toast.error(t('failed_create_invite_link'));
          return;
        }

        if (!newInvitation?.token) {
          console.error('No token returned from invitation creation');
          toast.error(t('failed_create_invite_link'));
          return;
        }

        inviteToken = newInvitation.token.trim();
        isExistingToken = false;
        console.log('Created new invitation token:', inviteToken);
      }

      // Final token validation
      if (!inviteToken || inviteToken.length < 10) {
        console.error('Invalid or empty token:', inviteToken);
        toast.error(t('invalid_invite_token'));
        return;
      }

      // Davet linkini oluştur
      const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;
      console.log('Generated invite URL:', inviteUrl);

      // Önce clipboard'a kopyala, sonra share'i dene
      const copySuccess = await copyToClipboard(inviteUrl, isExistingToken);

      // Clipboard başarılıysa share'i de dene (opsiyonel)
      if (copySuccess && navigator.share) {
        try {
          const shareData = {
            title: `${t('join_event')}: ${event?.name}`,
            text: `${event?.name} - ${event?.description}`,
            url: inviteUrl
          };

          // canShare kontrolü varsa ve destekliyorsa
          if (typeof navigator.canShare === 'function') {
            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
              console.log('Share successful');
            }
          } else {
            // canShare yoksa direkt share'i dene
            await navigator.share(shareData);
            console.log('Share successful (without canShare check)');
          }
        } catch (shareError) {
          console.log('Share failed or cancelled:', shareError);
          // Share başarısız oldu ama clipboard zaten başarılı, sorun yok
        }
      }
    } catch (err) {
      console.error('Error sharing event:', err);
      toast.error(t('share_failed'));
    }
  };

  // Clipboard'a kopyalama fonksiyonu - return success status
  const copyToClipboard = async (
    text: string,
    isExisting: boolean
  ): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(
          isExisting
            ? t('existing_invite_link_copied')
            : t('invite_link_copied_to_clipboard')
        );
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (success) {
          toast.success(
            isExisting
              ? t('existing_invite_link_copied')
              : t('invite_link_copied_to_clipboard')
          );
          return true;
        } else {
          throw new Error('execCommand failed');
        }
      }
    } catch (clipboardError) {
      console.error('Clipboard error:', clipboardError);
      toast.error(t('failed_copy_to_clipboard'));
      return false;
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
          'env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 20px) env(safe-area-inset-left, 20px)'
      },

      floatingElement: {
        position: 'absolute' as const,
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 12s ease-in-out infinite',
        pointerEvents: 'none' as const
      },

      eventContainer: {
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative' as const
      },

      backButton: {
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

      eventTitle: {
        flex: 1,
        textAlign: 'center' as const,
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'white',
        margin: '0 16px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      actionButtons: {
        display: 'flex',
        gap: '8px'
      },

      actionButton: {
        width: '40px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '10px',
        color: '#e2e8f0',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      eventInfoCard: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '24px',
        marginBottom: '20px'
      },

      sectionTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '16px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      },

      infoItem: {
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      },

      infoLabel: {
        color: '#00f5ff',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '6px'
      },

      infoValue: {
        color: 'white',
        fontSize: '14px',
        fontWeight: '500'
      },

      expensesCard: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '24px'
      },

      expensesHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      },

      addExpenseButton: {
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      emptyState: {
        textAlign: 'center' as const,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '15px',
        padding: '30px 20px'
      },

      loading: {
        textAlign: 'center' as const,
        color: '#00f5ff',
        fontSize: '18px',
        padding: '60px 20px'
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

        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .event-container {
            padding: 16px !important;
            max-width: 100% !important;
          }
          .event-title {
            font-size: 1.25rem !important;
            margin: 0 12px !important;
          }
          .action-buttons {
            gap: 6px !important;
          }
          .expenses-header {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: flex-start !important;
          }
          .header {
            padding: 16px 20px !important;
          }
          .event-info-card,
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
          .event-title {
            font-size: 1.1rem !important;
          }
          .action-button {
            width: 36px !important;
            height: 36px !important;
            font-size: 14px !important;
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
          .event-info-card,
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
        <div style={styles.eventContainer}>
          <div style={styles.loading}>{t('loading_event_details')}</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        {FloatingElements}
        {LanguageSelector}
        <div style={styles.eventContainer}>
          <div style={styles.loading}>{t('event_not_found')}</div>
        </div>
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

      <div style={styles.eventContainer}>
        <div
          style={styles.networkIndicator}
          title={isOnline ? 'Online' : 'Offline'}
        ></div>

        {/* Header */}
        <div style={styles.header} className="header">
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

          <h1 style={styles.eventTitle} className="event-title">
            {event.name}
          </h1>

          <div style={styles.actionButtons} className="action-buttons">
            <button
              style={styles.actionButton}
              className="action-button"
              onClick={handleEditEvent}
              title={t('edit_event_button')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              ✏️
            </button>
            <button
              style={styles.actionButton}
              className="action-button"
              onClick={handleShareEvent}
              title={t('share_event_button')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              🔗
            </button>
          </div>
        </div>

        {/* Event Info Card */}
        <div style={styles.eventInfoCard} className="event-info-card">
          <h2 style={styles.sectionTitle}>{t('event_details_title')}</h2>
          <div style={styles.infoGrid} className="info-grid">
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>{t('event_date_label')}</div>
              <div style={styles.infoValue}>
                {formatDate(event.planned_start_date)}
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>{t('event_duration_label')}</div>
              <div style={styles.infoValue}>
                {formatDuration(event.planned_duration_days)}
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>{t('event_location_label')}</div>
              <div style={styles.infoValue}>
                {event.place_country} - {event.place_city}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div style={styles.expensesCard} className="expenses-card">
          <div style={styles.expensesHeader} className="expenses-header">
            <h2 style={styles.sectionTitle}>{t('expenses_section_title')}</h2>
            <button
              style={styles.addExpenseButton}
              onClick={handleAddExpense}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 10px 30px rgba(0, 245, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>+</span>
              {t('add_expense_button')}
            </button>
          </div>

          {expenses.length === 0 ? (
            <div style={styles.emptyState}>{t('no_expenses_yet')}</div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
