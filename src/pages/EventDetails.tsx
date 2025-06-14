import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';

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

interface User {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Expense {
  id: string;
  event_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  expense_date: string;
  category: string;
  created_at: string;
  conversion_rate_to_event_currency?: number; // Added for total calculation
  users: User;
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

const ExpenseCard: React.FC<{ expense: Expense }> = ({ expense }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      onClick={() =>
        navigate(`/events/${expense.event_id}/expenses/${expense.id}/edit`)
      }
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

const EventDetails: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  // NEW: State for participant count and total expenses
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  // NEW: State for participants modal
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantsList, setParticipantsList] = useState<User[]>([]);

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
      loadParticipantCount(); // NEW: Load participant count
    }
  }, [eventId]);

  // NEW: Calculate total expenses when expenses or event changes
  useEffect(() => {
    if (event && expenses.length > 0) {
      calculateTotalExpenses();
    } else {
      setTotalExpenses(0);
    }
  }, [expenses, event]);

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
      // Modified query to include conversion_rate_to_event_currency
      const { data, error } = await supabase
        .from('expenses')
        .select(
          `
          *,
          users!paid_by(id, auth_user_id, first_name, last_name, email)
        `
        )
        .eq('event_id', eventId)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error loading expenses:', error);
        return;
      }

      setExpenses(data || []);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setExpenses([]);
    }
  };

  // NEW: Load participant count
  const loadParticipantCount = async () => {
    try {
      const { count, error } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'active');

      if (error) {
        console.error('Error loading participant count:', error);
        return;
      }

      setParticipantCount(count || 0);
    } catch (err) {
      console.error('Error loading participant count:', err);
      setParticipantCount(0);
    }
  };

  // NEW: Load participants details for modal
  const loadParticipantsDetails = async () => {
    try {
      // First, get event participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from('event_participants')
          .select('user_id, role')
          .eq('event_id', eventId)
          .eq('status', 'active');

      if (participantsError) {
        console.error('Error loading participants:', participantsError);
        toast.error(t('failed_to_load_participants'));
        return;
      }

      if (!participantsData || participantsData.length === 0) {
        setParticipantsList([]);
        return;
      }

      // Get user IDs from participants
      const userIds = participantsData.map((p) => p.user_id);

      // Fetch users with first_name and last_name
      let usersData, usersError;

      // Try with 'id' column first
      const idResult = await supabase
        .from('users')
        .select('id, auth_user_id, first_name, last_name, email')
        .in('id', userIds);

      if (!idResult.error && idResult.data && idResult.data.length > 0) {
        usersData = idResult.data;
        usersError = null;
      } else {
        // If 'id' doesn't work, try 'auth_user_id'
        const authIdResult = await supabase
          .from('users')
          .select('id, auth_user_id, first_name, last_name, email')
          .in('auth_user_id', userIds);

        if (
          !authIdResult.error &&
          authIdResult.data &&
          authIdResult.data.length > 0
        ) {
          usersData = authIdResult.data;
          usersError = null;
        } else {
          usersData = null;
          usersError = authIdResult.error || idResult.error;
        }
      }

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast.error(t('failed_to_load_participants'));
        return;
      }

      if (!usersData || usersData.length === 0) {
        setParticipantsList([]);
        return;
      }

      // Transform the data
      const transformedParticipants: User[] = usersData.map((user: any) => ({
        id: user.id,
        auth_user_id: user.auth_user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }));

      setParticipantsList(transformedParticipants);
    } catch (err) {
      console.error('Error loading participants details:', err);
      setParticipantsList([]);
    }
  };

  // NEW: Calculate total expenses in event's default currency
  const calculateTotalExpenses = () => {
    if (!event || !expenses.length) {
      setTotalExpenses(0);
      return;
    }

    const total = expenses.reduce((sum, expense) => {
      let expenseInEventCurrency: number;

      if (expense.currency === event.default_currency) {
        // Same currency - use amount as is
        expenseInEventCurrency = expense.amount;
      } else {
        // Different currency - use conversion rate
        const conversionRate = expense.conversion_rate_to_event_currency || 1;
        expenseInEventCurrency = expense.amount * conversionRate;
      }

      return sum + expenseInEventCurrency;
    }, 0);

    setTotalExpenses(total);
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

  // NEW: Format participant count
  const formatParticipantCount = (count: number) => {
    return `${count} ${count === 1 ? t('participant') : t('participants')}`;
  };

  // NEW: Handle participants modal
  const handleShowParticipants = async () => {
    setShowParticipantsModal(true);
    await loadParticipantsDetails();
  };

  // NEW: Format total expenses
  const formatTotalExpenses = (total: number, currency: string) => {
    return `${total.toFixed(2)} ${currency}`;
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
          'env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 120px) env(safe-area-inset-left, 20px)', // Increased bottom padding for BottomNavigation
        paddingBottom: '120px' // Extra padding for BottomNavigation
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

      // NEW: Section header with action buttons
      sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      },

      actionButtons: {
        display: 'flex',
        gap: '8px'
      },

      actionButton: {
        width: '36px',
        height: '36px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        color: '#e2e8f0',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
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

      // NEW: Clickable info item for participants
      infoItemClickable: {
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      },

      // NEW: Payments/Settlements info item with different tone
      infoItemPayments: {
        padding: '12px',
        background: 'rgba(255, 107, 107, 0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 107, 107, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
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

      // NEW: Payments/Settlements label and value styles
      infoLabelPayments: {
        color: '#ff6b6b',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '6px'
      },

      infoValuePayments: {
        color: '#ff6b6b',
        fontSize: '14px',
        fontWeight: '600'
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
      },

      // Participants modal styles (similar to currency confirmation)
      modalOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      },

      modalDialog: {
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '70vh',
        overflowY: 'auto' as const,
        margin: '20px',
        color: 'white'
      },

      modalTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '16px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      modalMessage: {
        fontSize: '16px',
        lineHeight: '1.5',
        marginBottom: '20px',
        color: 'rgba(255, 255, 255, 0.9)'
      },

      participantsList: {
        maxHeight: '300px',
        overflowY: 'auto' as const,
        marginBottom: '20px'
      },

      participantItem: {
        padding: '12px 16px',
        marginBottom: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease'
      },

      participantName: {
        fontSize: '15px',
        fontWeight: '600',
        color: 'white',
        marginBottom: '4px'
      },

      participantEmail: {
        fontSize: '13px',
        color: 'rgba(255, 255, 255, 0.7)'
      },

      modalButtons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      },

      modalButton: {
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: 'none',
        minWidth: '80px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white'
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

  // Participants modal (similar to currency confirmation modal)
  const ParticipantsModal = useMemo(() => {
    if (!showParticipantsModal) return null;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalDialog}>
          <h3 style={styles.modalTitle}>
            {t('participants_list_title')} ({participantCount})
          </h3>

          {participantsList.length === 0 ? (
            <p style={styles.modalMessage}>{t('loading_participants')}...</p>
          ) : (
            <>
              <p style={styles.modalMessage}>{t('participants_in_event')}:</p>
              <div style={styles.participantsList}>
                {participantsList.map((participant, index) => {
                  const displayName = getUserDisplayName(participant, t);
                  const isEmailAsName =
                    !participant.first_name &&
                    !participant.last_name &&
                    participant.email;

                  return (
                    <div key={participant.id} style={styles.participantItem}>
                      <div style={styles.participantName}>
                        {index + 1}. {displayName}
                      </div>
                      {/* Only show email if it's not already being used as the display name */}
                      {!isEmailAsName && (
                        <div style={styles.participantEmail}>
                          📧 {participant.email || t('no_email')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div style={styles.modalButtons}>
            <button
              style={styles.modalButton}
              onClick={() => setShowParticipantsModal(false)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    );
  }, [showParticipantsModal, participantCount, participantsList, styles, t]);

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
            padding: 16px 16px 120px 16px !important; /* Added bottom padding for mobile */
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
          .section-header {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: flex-start !important;
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
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
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
        <BottomNavigation />
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

      {/* Participants Modal */}
      {ParticipantsModal}

      <div style={styles.eventContainer}>
        <div
          style={styles.networkIndicator}
          title={isOnline ? 'Online' : 'Offline'}
        ></div>

        {/* Header - Now only contains back button and event title */}
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
        </div>

        {/* Event Info Card - UPDATED with edit and share buttons in section header */}
        <div style={styles.eventInfoCard} className="event-info-card">
          <div style={styles.sectionHeader} className="section-header">
            <h2 style={styles.sectionTitle}>{t('event_details_title')}</h2>
            <div style={styles.actionButtons} className="action-buttons">
              <button
                style={styles.actionButton}
                className="action-button"
                onClick={handleEditEvent}
                title={t('edit_event_button')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.2)';
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
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.2)';
                }}
              >
                🔗
              </button>
            </div>
          </div>

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
            {/* NEW: Participants count - CLICKABLE */}
            <div
              style={styles.infoItemClickable}
              onClick={handleShowParticipants}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={styles.infoLabel}>
                {t('participants_count_label')}
              </div>
              <div style={styles.infoValue}>
                {formatParticipantCount(participantCount)}
              </div>
            </div>
            {/* NEW: Total expenses */}
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>
                {t('total_expenses_label')} ({event.default_currency})
              </div>
              <div style={styles.infoValue}>
                {formatTotalExpenses(totalExpenses, event.default_currency)}
              </div>
            </div>
            {/* NEW: Payments/Settlements - CLICKABLE with different tone */}
            <div
              style={styles.infoItemPayments}
              onClick={() => navigate(`/events/${eventId}/settlement`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.4)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(255, 107, 107, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.infoLabelPayments}>
                {t('settlements_label')}
              </div>
              <div style={styles.infoValuePayments}>
                {t('view_settlements')} →
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
      <BottomNavigation />
    </div>
  );
};

export default EventDetails;
