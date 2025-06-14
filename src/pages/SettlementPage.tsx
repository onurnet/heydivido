import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';

interface User {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface SettlementItem {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

const SettlementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  // Data states
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<User[]>([]);

  // ✅ userNames state'i eklendi
  const [userNames, setUserNames] = useState<{ [userId: string]: string }>({});

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Load settlement data
  useEffect(() => {
    if (eventId) {
      loadSettlementData();
    }
  }, [eventId]);

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

  const loadSettlementData = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error(t('user_not_authenticated'));
        return;
      }

      setCurrentUserId(user.id);

      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error loading event:', eventError);
        toast.error(t('failed_load_event'));
        return;
      }

      setEvent(eventData);

      // Step 1: Get participants (simple approach)
      const { data: participantsData, error: participantsError } =
        await supabase
          .from('event_participants')
          .select('user_id')
          .eq('event_id', eventId)
          .eq('status', 'active');

      if (participantsError) {
        console.error('Error loading participants:', participantsError);
        toast.error(t('failed_to_load_participants'));
        return;
      }

      console.log('Participants data:', participantsData);

      // Step 2: Get all users (we'll filter later)
      const { data: allUsersData, error: usersError } = await supabase
        .from('users')
        .select('id, auth_user_id, first_name, last_name, email');

      if (usersError) {
        console.error('Error loading users:', usersError);
        toast.error(t('failed_to_load_participants'));
        return;
      }

      console.log('All users data:', allUsersData);

      // Step 3: Get expenses with user info
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('event_id', eventId);

      if (expensesError) {
        console.error('Error loading expenses:', expensesError);
        toast.error(t('failed_load_expenses'));
        return;
      }

      console.log('Expenses data:', expensesData);

      // Step 4: Match participants with users and expenses with users
      const participantIds = participantsData?.map((p) => p.user_id) || [];
      const participantUsers =
        allUsersData?.filter(
          (user) =>
            participantIds.includes(user.auth_user_id) ||
            participantIds.includes(user.id)
        ) || [];

      console.log('Filtered participant users:', participantUsers);

      // ✅ participants state set et (safeCurrentUserName için kullanacağız)
      setParticipants(participantUsers);

      // Step 5: Enrich expenses with user information
      const enrichedExpenses =
        expensesData?.map((expense) => {
          const expenseUser = allUsersData?.find(
            (user) =>
              user.auth_user_id === expense.paid_by ||
              user.id === expense.paid_by
          );
          return {
            ...expense,
            users: expenseUser || {
              id: expense.paid_by,
              auth_user_id: expense.paid_by,
              first_name: '',
              last_name: '',
              email: expense.paid_by
            }
          };
        }) || [];

      console.log('Enriched expenses:', enrichedExpenses);

      // Step 6: Calculate settlements
      const calculatedSettlements = await calculateSettlements(
        enrichedExpenses,
        participantUsers,
        eventData
      );

      console.log('Calculated settlements:', calculatedSettlements);
      setSettlements(calculatedSettlements);
    } catch (err) {
      console.error('Error loading settlement data:', err);
      toast.error(t('failed_load_settlements'));
    } finally {
      setLoading(false);
    }
  };

  const calculateSettlements = async (
    expenses: any[],
    participants: User[],
    eventData: any
  ): Promise<SettlementItem[]> => {
    console.log('Starting settlement calculation...');
    console.log('Participants:', participants);
    console.log('Expenses:', expenses);
    console.log('Event data:', eventData);

    if (!participants || participants.length === 0) {
      console.log('No participants found');
      return [];
    }

    if (!expenses || expenses.length === 0) {
      console.log('No expenses found');
      return [];
    }

    // Create a map of user balances and names
    const balances: { [userId: string]: number } = {};
    const localUserNames: { [userId: string]: string } = {};

    // Initialize balances for all participants
    participants.forEach((user) => {
      const userId = user.auth_user_id || user.id;
      balances[userId] = 0;
      localUserNames[userId] = getUserDisplayName(user);
    });

    // ✅ userNames state'ini güncelle
    setUserNames(localUserNames);

    console.log('Initial balances:', balances);
    console.log('User names:', localUserNames);

    // Prepare map: real_id → auth_user_id
    const idToAuthUserIdMap: { [key: string]: string } = {};
    participants.forEach((user) => {
      idToAuthUserIdMap[user.id] = user.auth_user_id;
    });

    // ✅ NEW APPROACH: Harcama bazlı paylaştırma
    // Her harcamayı sadece o harcamaya katılan kişiler arasında paylaştır
    for (const expense of expenses) {
      let expenseInEventCurrency = expense.amount;
      if (expense.currency !== eventData.default_currency) {
        const conversionRate = expense.conversion_rate_to_event_currency || 1;
        expenseInEventCurrency = expense.amount * conversionRate;
      }

      // Harcamaya katılan kişileri bul
      let expenseParticipants: string[] = [];

      // Önce expense.participants dizisini kontrol et
      if (expense.participants && Array.isArray(expense.participants)) {
        // expense.participants real_id listesi olabilir, auth_user_id'ye çevir
        expenseParticipants = expense.participants
          .map((participantId) => {
            const participant = participants.find(
              (p) => p.id === participantId || p.auth_user_id === participantId
            );
            return participant
              ? participant.auth_user_id || participant.id
              : null;
          })
          .filter(Boolean) as string[];
      } else {
        // expense_participants tablosundan çek
        try {
          const { data: expenseParticipantsData, error } = await supabase
            .from('expenses_participants')
            .select('user_id')
            .eq('expense_id', expense.id);

          if (error) {
            console.warn(
              `Error loading participants for expense ${expense.id}:`,
              error
            );
            // Fallback: tüm etkinlik katılımcıları
            expenseParticipants = participants.map(
              (p) => p.auth_user_id || p.id
            );
          } else {
            // ✅ expense_participants.user_id zaten auth_user_id olarak kaydedilmiş
            expenseParticipants =
              expenseParticipantsData?.map((ep) => ep.user_id) || [];
            console.log(
              `Expense ${expense.id} participants from DB (auth_user_ids):`,
              expenseParticipants
            );
          }
        } catch (err) {
          console.warn(
            `Error fetching expense participants for ${expense.id}:`,
            err
          );
          // Fallback: tüm etkinlik katılımcıları
          expenseParticipants = participants.map((p) => p.auth_user_id || p.id);
        }
      }

      // Eğer hiç katılımcı yoksa, fallback olarak tüm etkinlik katılımcıları
      if (expenseParticipants.length === 0) {
        expenseParticipants = participants.map((p) => p.auth_user_id || p.id);
      }

      console.log(
        `Expense: ${expense.description}, Amount: ${expenseInEventCurrency}, Participants (auth_user_ids):`,
        expenseParticipants
      );

      // Ödeyenin bakiyesini artır (ne kadar ödediği)
      const paidByAuthUserId =
        idToAuthUserIdMap[expense.paid_by] || expense.paid_by;
      if (balances.hasOwnProperty(paidByAuthUserId)) {
        balances[paidByAuthUserId] += expenseInEventCurrency;
        console.log(
          `${localUserNames[paidByAuthUserId]} paid ${expenseInEventCurrency}`
        );
      }

      // expense_participants tablosundan pay oranlarını al
      const { data: expenseShares, error: shareError } = await supabase
        .from('expenses_participants')
        .select('user_id, share_amount')
        .eq('expense_id', expense.id);

      if (shareError) {
        console.warn(
          `⚠️ Could not load shares for expense ${expense.id}`,
          shareError
        );
        continue;
      }

      for (const row of expenseShares || []) {
        const realUserId = row.user_id;
        const authUserId = idToAuthUserIdMap[realUserId] || realUserId;
        const shareAmount = row.share_amount || 0;

        if (balances.hasOwnProperty(authUserId)) {
          balances[authUserId] -= shareAmount;
          console.log(
            `${localUserNames[authUserId]} owes ${shareAmount} for this expense`
          );
        }
      }
    }

    console.log('Final balances after expense-based calculation:', balances);

    // ✅ SETTLEMENT ALGORITHM: "En büyük alacaklıyı önce kapat" prensibi
    const settlements: SettlementItem[] = [];
    const workingBalances = { ...balances }; // Çalışma kopyası

    // Settlement döngüsü - bakiyeler sıfırlanana kadar devam et
    while (true) {
      // En büyük alacaklıyı bul (pozitif bakiye)
      let maxCreditor = '';
      let maxCredit = 0;
      Object.keys(workingBalances).forEach((userId) => {
        if (workingBalances[userId] > maxCredit) {
          maxCredit = workingBalances[userId];
          maxCreditor = userId;
        }
      });

      // En büyük borçluyu bul (negatif bakiye)
      let maxDebtor = '';
      let maxDebt = 0;
      Object.keys(workingBalances).forEach((userId) => {
        if (workingBalances[userId] < -maxDebt) {
          maxDebt = -workingBalances[userId];
          maxDebtor = userId;
        }
      });

      // Eğer anlamlı bir alacaklı veya borçlu yoksa döngüyü sonlandır
      if (maxCredit < 0.01 || maxDebt < 0.01) {
        console.log('Settlement completed - no significant balances remaining');
        break;
      }

      // Transfer edilecek minimum tutarı hesapla
      const transferAmount = Math.min(maxCredit, maxDebt);

      console.log(
        `Settlement: ${localUserNames[maxDebtor]} pays ${transferAmount} to ${localUserNames[maxCreditor]}`
      );

      // Settlement item'ını ekle
      settlements.push({
        from: localUserNames[maxDebtor] || maxDebtor,
        to: localUserNames[maxCreditor] || maxCreditor,
        amount: Math.round(transferAmount * 100) / 100, // 2 ondalık basamak
        currency: eventData.default_currency
      });

      // Bakiyeleri güncelle
      workingBalances[maxCreditor] -= transferAmount;
      workingBalances[maxDebtor] += transferAmount;

      console.log(
        `Updated balances - ${maxCreditor}: ${workingBalances[maxCreditor]}, ${maxDebtor}: ${workingBalances[maxDebtor]}`
      );

      // Güvenlik kontrolü - sonsuz döngüyü önle
      if (settlements.length > participants.length * 2) {
        console.warn(
          'Settlement calculation took too many iterations, breaking...'
        );
        break;
      }
    }

    console.log('Final settlements:', settlements);
    return settlements;
  };

  const getUserDisplayName = (user: User): string => {
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

  // ✅ getUserNameFromId fonksiyonu eklendi (state üzerinden çalışıyor)
  const getUserNameFromId = (userId: string): string => {
    return userNames[userId] || userId;
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // ✅ safeCurrentUserName → currentUserId'ye göre displayName üretiyoruz
  const safeCurrentUserName = useMemo(() => {
    const currentUser = participants.find(
      (user) => user.auth_user_id === currentUserId || user.id === currentUserId
    );
    return currentUser ? getUserDisplayName(currentUser) : currentUserId || ''; // fallback
  }, [participants, currentUserId]);

  // Seninle ilgili olan işlemler
  const yourTransactions = settlements.filter(
    (s) => s.from === safeCurrentUserName || s.to === safeCurrentUserName
  );

  // Diğerleri arasındaki işlemler
  const otherTransactions = settlements.filter(
    (s) => s.from !== safeCurrentUserName && s.to !== safeCurrentUserName
  );

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

      settlementContainer: {
        width: '100%',
        maxWidth: '600px',
        position: 'relative' as const,
        zIndex: 2,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.8s ease-out'
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

      pageTitle: {
        flex: 1,
        textAlign: 'center' as const,
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'white',
        margin: '0 16px',
        background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      spacer: {
        width: '60px' // To balance the header layout
      },

      sectionCard: {
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

      // Your transactions with special highlight
      yourSectionTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '16px',
        background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      transactionCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        transition: 'all 0.3s ease',
        position: 'relative' as const
      },

      // Special styling for user's transactions
      yourTransactionCard: {
        background: 'rgba(255, 107, 107, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 107, 107, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        transition: 'all 0.3s ease',
        position: 'relative' as const
      },

      transactionText: {
        color: 'white',
        fontSize: '15px',
        fontWeight: '500',
        lineHeight: '1.5',
        margin: 0
      },

      yourTransactionText: {
        color: '#ff6b6b',
        fontSize: '15px',
        fontWeight: '600',
        lineHeight: '1.5',
        margin: 0
      },

      amountHighlight: {
        color: '#00f5ff',
        fontWeight: '700'
      },

      yourAmountHighlight: {
        color: '#ff6b6b',
        fontWeight: '700'
      },

      emptyState: {
        textAlign: 'center' as const,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '15px',
        padding: '30px 20px',
        fontStyle: 'italic'
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
        background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
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

      // Transaction direction indicators
      payIcon: {
        color: '#ff6b6b',
        marginRight: '8px',
        fontSize: '16px'
      },

      receiveIcon: {
        color: '#4CAF50',
        marginRight: '8px',
        fontSize: '16px'
      },

      transferIcon: {
        color: '#00f5ff',
        marginRight: '8px',
        fontSize: '16px'
      }
    }),
    [isOnline, isVisible]
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
            background: 'rgba(255, 107, 107, 0.08)',
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
            background: 'rgba(254, 202, 87, 0.08)',
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
          .settlement-container {
            padding: 16px 16px 120px 16px !important;
            max-width: 100% !important;
          }
          .page-title {
            font-size: 1.25rem !important;
            margin: 0 12px !important;
          }
          .header {
            padding: 16px 20px !important;
          }
          .section-card {
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
          .page-title {
            font-size: 1.1rem !important;
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
          .section-card {
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
        <div style={styles.settlementContainer}>
          <div
            style={{
              textAlign: 'center' as const,
              color: '#ff6b6b',
              fontSize: '18px',
              padding: '60px 20px'
            }}
          >
            <div style={{ marginBottom: '1rem' }}>📊</div>
            {t('calculating_settlements')}...
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

      <div style={styles.settlementContainer} className="settlement-container">
        <div
          style={styles.networkIndicator}
          title={isOnline ? 'Online' : 'Offline'}
        ></div>

        {/* Header */}
        <div style={styles.header} className="header">
          <button
            style={styles.backButton}
            onClick={() => navigate(-1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ← {t('back')}
          </button>

          <h1 style={styles.pageTitle} className="page-title">
            {t('settlement_summary')}
          </h1>

          <div style={styles.spacer}></div>
        </div>

        {/* Your Transactions Section */}
        <div style={styles.sectionCard} className="section-card">
          <h2 style={styles.yourSectionTitle}>{t('your_transactions')}</h2>
          {yourTransactions.length === 0 ? (
            <div style={styles.emptyState}>
              💰 {t('no_personal_transactions')}
            </div>
          ) : (
            yourTransactions.map((s, index) => {
              const currentUserName = getUserNameFromId(currentUserId);
              return (
                <div
                  key={index}
                  style={styles.yourTransactionCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 107, 107, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.borderColor =
                      'rgba(255, 107, 107, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 107, 107, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor =
                      'rgba(255, 107, 107, 0.2)';
                  }}
                >
                  <p style={styles.yourTransactionText}>
                    {s.from === currentUserName ? (
                      <>
                        <span style={styles.payIcon}>📤</span>
                        {t('you_pay_to', { name: s.to })}:{' '}
                        <span style={styles.yourAmountHighlight}>
                          {s.amount.toFixed(2)} {s.currency}
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={styles.receiveIcon}>📥</span>
                        {t('you_receive_from', { name: s.from })}:{' '}
                        <span style={styles.yourAmountHighlight}>
                          {s.amount.toFixed(2)} {s.currency}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Other Transactions Section */}
        <div style={styles.sectionCard} className="section-card">
          <h2 style={styles.sectionTitle}>{t('other_transactions')}</h2>
          {otherTransactions.length === 0 ? (
            <div style={styles.emptyState}>🔄 {t('no_other_transactions')}</div>
          ) : (
            otherTransactions.map((s, index) => (
              <div
                key={index}
                style={styles.transactionCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.1)';
                }}
              >
                <p style={styles.transactionText}>
                  <span style={styles.transferIcon}>↔️</span>
                  {s.from} → {s.to}:{' '}
                  <span style={styles.amountHighlight}>
                    {s.amount.toFixed(2)} {s.currency}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SettlementPage;
