import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import GeoapifyAutocomplete from '../components/GeoapifyAutocomplete/GeoapifyAutocomplete';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';

// Types
interface User {
  id: string; // auth_user_id → UI için kullanılıyor
  real_id: string; // users.id → FK için kullanıyoruz (expenses.paid_by)
  name: string;
  email?: string;
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

  const [lockedParticipants, setLockedParticipants] = useState<Set<string>>(
    new Set()
  );

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(true);

  // Participants data
  const [eventParticipants, setEventParticipants] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

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

  const [manualPlaceName, setManualPlaceName] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');

  const [paidByUserId, setPaidByUserId] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantShares, setParticipantShares] = useState<{
    [userId: string]: number;
  }>({});

  const [splitMethod, setSplitMethod] = useState<'equal' | 'manual'>('equal');

  const [saving, setSaving] = useState(false);

  // NEW: Currency conversion states
  const [eventDefaultCurrency, setEventDefaultCurrency] = useState<string>('');
  const [showCurrencyConfirmation, setShowCurrencyConfirmation] =
    useState(false);
  const [conversionRate, setConversionRate] = useState<number>(1);
  const [pendingExpenseData, setPendingExpenseData] = useState<any>(null);

  const currencies = ['EUR', 'USD', 'GBP', 'TRY'];

  const currencyOptions: DropdownOption[] = currencies.map((curr) => ({
    value: curr,
    label: curr
  }));

  const userOptions: DropdownOption[] = eventParticipants.map((user) => ({
    value: user.real_id, // FK için doğru olan bu!
    label: user.name
  }));

  // NEW: Fetch event details to get default currency
  const fetchEventDetails = async () => {
    if (!eventId) return;

    try {
      const { data: eventData, error } = await supabase
        .from('events')
        .select('default_currency')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event details:', error);
        toast.error(t('failed_to_load_event'));
        return;
      }

      if (eventData) {
        setEventDefaultCurrency(eventData.default_currency || 'EUR');
      }
    } catch (err) {
      console.error('Error in fetchEventDetails:', err);
    }
  };

  // NEW: Fetch conversion rate from API
  const fetchConversionRate = async (
    fromCurrency: string,
    toCurrency: string
  ): Promise<number | null> => {
    try {
      // Try with frankfurter.app (very reliable)
      const response = await fetch(
        `https://api.frankfurter.app/latest?amount=1&from=${fromCurrency}&to=${toCurrency}`
      );
      const data = await response.json();

      if (data && data.rates && data.rates[toCurrency]) {
        console.log(
          `Fetched rate via frankfurter: 1 ${fromCurrency} = ${data.rates[toCurrency]} ${toCurrency}`
        );
        return data.rates[toCurrency];
      }

      console.error('Frankfurter API failed');
      return null;
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      return null;
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching current user:', error);
        return;
      }
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (err) {
      console.error('Error in fetchCurrentUser:', err);
    }
  };

  // Fetch event participants - ONLY for the specific event
  const fetchEventParticipants = async () => {
    if (!eventId) {
      console.error('No eventId provided - cannot fetch participants');
      toast.error(t('event_not_found'));
      navigate('/events');
      return;
    }

    setParticipantsLoading(true);
    try {
      console.log(`Fetching participants for event: ${eventId}`);

      // First, get event participants
      const { data: basicParticipants, error: basicError } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId);

      console.log('Basic participants query result:', {
        data: basicParticipants,
        error: basicError
      });

      if (basicError) {
        console.error('Error in basic participants query:', basicError);
        toast.error(
          t('failed_to_load_participants') + ': ' + basicError.message
        );
        return;
      }

      if (!basicParticipants || basicParticipants.length === 0) {
        console.warn(`No participants found for event ${eventId}`);
        setEventParticipants([]);
        return;
      }

      // Get user IDs from participants
      const userIds = basicParticipants.map((p) => p.user_id);
      console.log('User IDs to fetch:', userIds);

      // Fetch users with first_name and last_name (we know these columns exist)
      // Try both possible user ID columns: 'id' and 'auth_user_id'
      let usersData, usersError;

      // First try with 'id' column
      const idResult = await supabase
        .from('users')
        .select('id, auth_user_id, first_name, last_name, email')
        .in('id', userIds);

      if (!idResult.error && idResult.data && idResult.data.length > 0) {
        // id ile bulundu
        usersData = idResult.data.map((user: any) => ({
          id: user.auth_user_id, // UI için auth_user_id kullanabilirsin
          real_id: user.id, // FK için users.id kullanacağız (paid_by için bu lazım!)
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }));
        usersError = null;
        console.log('Users found with id column:', usersData);
      } else {
        // If 'id' doesn't work, try 'auth_user_id'
        console.log('Trying with auth_user_id column...');
        const authIdResult = await supabase
          .from('users')
          .select('id, auth_user_id, first_name, last_name, email')
          .in('auth_user_id', userIds);

        if (
          !authIdResult.error &&
          authIdResult.data &&
          authIdResult.data.length > 0
        ) {
          usersData = authIdResult.data.map((user: any) => ({
            id: user.auth_user_id, // UI için auth_user_id
            real_id: user.id, // FK için users.id kullanacağız (paid_by için)
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
          }));
          usersError = null;
          console.log('Users found with auth_user_id column:', usersData);
        } else {
          usersData = null;
          usersError = authIdResult.error || idResult.error;
          console.log('Both queries failed:', { idResult, authIdResult });
        }
      }

      console.log('Users fetch result:', {
        data: usersData,
        error: usersError
      });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast.error(
          t('failed_to_load_participants') + ': ' + usersError.message
        );
        return;
      }

      if (!usersData || usersData.length === 0) {
        console.warn('No user data found for participant IDs');
        // Fallback: create user objects with IDs as names
        const fallbackParticipants: User[] = userIds.map((userId) => ({
          id: userId,
          real_id: userId, // Fallback: use same ID for both
          name: `User ${userId.slice(0, 8)}...`,
          email: ''
        }));

        // Set state
        setEventParticipants(fallbackParticipants);

        // IMMEDIATELY set default values using local array (not state)
        if (fallbackParticipants.length > 0) {
          const defaultUser = fallbackParticipants[0];
          console.log('Setting fallback default paid by user:', defaultUser);
          setPaidByUserId(defaultUser.real_id);
          setParticipants([defaultUser.id]);
        }

        return;
      }

      // Transform the data - combine first_name and last_name
      const finalParticipants: User[] = usersData.map((user: any) => {
        let displayName = '';

        if (user.first_name && user.last_name) {
          displayName = `${user.first_name} ${user.last_name}`;
        } else if (user.first_name) {
          displayName = user.first_name;
        } else if (user.last_name) {
          displayName = user.last_name;
        } else if (user.email) {
          const emailParts = user.email.split('@');
          if (emailParts.length === 2) {
            const username = emailParts[0];
            const domain = emailParts[1];
            const domainShort =
              domain.length >= 3 ? domain.substring(0, 3) : domain;
            displayName = `${username} (${domainShort})`;
          } else {
            displayName = user.email;
          }
        } else {
          displayName = `User ${user.id.slice(0, 8)}...`;
        }

        return {
          id: user.id, // auth_user_id for UI
          real_id: user.real_id, // users.id for FK
          name: displayName.trim(),
          email: user.email || ''
        };
      });

      console.log(
        `Found ${finalParticipants.length} participants for event ${eventId}:`,
        finalParticipants
      );

      // Set participants state
      setEventParticipants(finalParticipants);

      // IMMEDIATELY set default values using local finalParticipants array (not state)
      // This prevents timing issues with React state updates
      if (finalParticipants.length > 0) {
        // Try to find current user in participants, otherwise use first participant
        const currentUserInEvent = finalParticipants.find(
          (p) => p.id === currentUserId
        );
        const defaultUser = currentUserInEvent || finalParticipants[0];

        console.log('Setting default paid by user immediately:', {
          currentUserId,
          currentUserInEvent,
          defaultUser,
          finalParticipants: finalParticipants.map((p) => ({
            id: p.id,
            real_id: p.real_id,
            name: p.name
          }))
        });

        // Set paid by user using real_id (for FK)
        setPaidByUserId(defaultUser.real_id);

        // Set participants array using auth_user_id (for UI)
        setParticipants([defaultUser.id]);

        console.log('✅ Default values set:', {
          setPaidByUserId: defaultUser.real_id,
          setParticipants: [defaultUser.id]
        });
      } else {
        console.warn('No participants found to set defaults');
      }
    } catch (err) {
      console.error('Error in fetchEventParticipants:', err);
      toast.error(
        t('failed_to_load_participants') + ': ' + (err as Error).message
      );
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCurrentUser();
      await fetchEventDetails(); // NEW: Fetch event details
      await fetchEventParticipants();
      setLoading(false);
    };

    loadData();
  }, [eventId]);

  // Update defaults when current user or participants change
  useEffect(() => {
    if (currentUserId && eventParticipants.length > 0 && !paidByUserId) {
      const currentUserInEvent = eventParticipants.find(
        (p) => p.id === currentUserId
      );
      const defaultUser = currentUserInEvent || eventParticipants[0];

      setPaidByUserId(defaultUser.real_id);
      if (participants.length === 0) {
        setParticipants([defaultUser.id]);
      }
    }
  }, [currentUserId, eventParticipants, paidByUserId, participants.length]);

  // Calculate participant shares based on split method
  const calculateShares = (
    totalAmount: number,
    participantIds: string[],
    method: 'equal' | 'manual',
    currentShares: { [userId: string]: number } = {}
  ) => {
    if (!totalAmount || participantIds.length === 0) {
      return {};
    }

    const newShares: { [userId: string]: number } = {};

    if (method === 'equal') {
      // Split equally among all participants
      const sharePerPerson = totalAmount / participantIds.length;
      participantIds.forEach((id) => {
        newShares[id] = sharePerPerson;
      });
    } else {
      // Manual split - preserve existing shares where possible
      let remainingAmount = totalAmount;
      let unallocatedParticipants: string[] = [];

      // First, account for participants who already have manual shares
      participantIds.forEach((id) => {
        if (currentShares[id] && currentShares[id] > 0) {
          newShares[id] = currentShares[id];
          remainingAmount -= currentShares[id];
        } else {
          unallocatedParticipants.push(id);
        }
      });

      // Split remaining amount equally among unallocated participants
      if (unallocatedParticipants.length > 0 && remainingAmount > 0) {
        const sharePerUnallocated =
          remainingAmount / unallocatedParticipants.length;
        unallocatedParticipants.forEach((id) => {
          newShares[id] = sharePerUnallocated;
        });
      } else if (unallocatedParticipants.length > 0) {
        // If no remaining amount, set to 0
        unallocatedParticipants.forEach((id) => {
          newShares[id] = 0;
        });
      }
    }

    return newShares;
  };

  // Update shares when amount or participants change
  useEffect(() => {
    if (amount && typeof amount === 'number' && participants.length > 0) {
      const newShares = calculateShares(
        amount,
        participants,
        splitMethod,
        participantShares
      );
      setParticipantShares(newShares);
    } else {
      setParticipantShares({});
    }
  }, [amount, participants, splitMethod]);

  // Handle manual share change
  const handleShareChange = (userId: string, newShare: number) => {
    if (splitMethod !== 'manual' || !amount || typeof amount !== 'number')
      return;

    const updatedShares = { ...participantShares };
    updatedShares[userId] = newShare;

    // Add this participant to lockedParticipants
    setLockedParticipants((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });

    // Recalculate remaining amount
    const allocatedAmount = participants.reduce((sum, id) => {
      if (lockedParticipants.has(id) || id === userId) {
        return sum + (updatedShares[id] || 0);
      }
      return sum;
    }, 0);

    const remainingAmount = amount - allocatedAmount;

    // Distribute remaining amount among unlocked participants
    const unlockedParticipants = participants.filter(
      (id) => !lockedParticipants.has(id) && id !== userId
    );

    if (unlockedParticipants.length > 0) {
      const sharePerUnlocked = remainingAmount / unlockedParticipants.length;

      unlockedParticipants.forEach((id) => {
        updatedShares[id] = sharePerUnlocked > 0 ? sharePerUnlocked : 0;
      });
    }

    setParticipantShares(updatedShares);
  };

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

  // MODIFIED: Updated handleSave with currency conversion logic
  const handleSave = async () => {
    if (!eventId) {
      toast.error(t('event_not_found'));
      return;
    }

    // DEBUG: Log current state for debugging
    console.log('=== VALIDATION DEBUG ===');
    console.log('isPlaceExpense:', isPlaceExpense);
    console.log('description:', description);
    console.log('amount:', amount);
    console.log('currency:', currency);
    console.log('paidByUserId:', paidByUserId);
    console.log('participants:', participants);
    console.log('manualPlaceName:', manualPlaceName);
    console.log('selectedPOI:', selectedPOI);

    // VALIDATION LOGIC WITH DEBUGGING

    // 1. Amount validation
    const isAmountValid =
      amount !== '' &&
      amount !== null &&
      amount !== undefined &&
      typeof amount === 'number' &&
      amount > 0;
    if (!isAmountValid) {
      console.log('❌ Amount validation failed:', amount);
      toast.error(t('fill_required_fields') + ' (Amount)');
      return;
    }

    // 2. Currency validation
    if (!currency || currency.trim() === '') {
      console.log('❌ Currency validation failed:', currency);
      toast.error(t('fill_required_fields') + ' (Currency)');
      return;
    }

    // 3. Paid by validation
    if (!paidByUserId || paidByUserId.trim() === '') {
      console.log('❌ PaidByUserId validation failed:', paidByUserId);
      toast.error(t('fill_required_fields') + ' (Paid By)');
      return;
    }

    // 4. Participants validation
    if (!participants || participants.length === 0) {
      console.log('❌ Participants validation failed:', participants);
      toast.error(t('fill_required_fields') + ' (Participants)');
      return;
    }

    // 5. Description validation (conditional)
    // - General Expense: description is REQUIRED
    // - Place Expense: description is OPTIONAL
    const isDescriptionValid = isPlaceExpense
      ? true // Place expense: description is optional
      : description && description.trim().length > 0; // General expense: description is required

    if (!isDescriptionValid) {
      console.log(
        '❌ Description validation failed for General Expense:',
        description
      );
      toast.error(
        t('fill_required_fields') +
          ' (Description required for General Expense)'
      );
      return;
    }

    // 6. Place validation (conditional)
    // - Place Expense: place info is REQUIRED (either manual name or selected POI)
    // - General Expense: place info is IGNORED
    let isPlaceValid = true;
    if (isPlaceExpense) {
      const hasManualPlace =
        manualPlaceName && manualPlaceName.trim().length > 0;
      const hasSelectedPOI =
        selectedPOI && selectedPOI.name && selectedPOI.name.trim().length > 0;
      isPlaceValid = hasManualPlace || hasSelectedPOI;

      if (!isPlaceValid) {
        console.log('❌ Place validation failed for Place Expense:');
        console.log('  manualPlaceName:', manualPlaceName);
        console.log('  selectedPOI:', selectedPOI);
        toast.error(
          t('fill_required_fields') + ' (Place required for Place Expense)'
        );
        return;
      }
    }

    console.log('✅ All validations passed!');

    setSaving(true);

    try {
      // Prepare expense data
      const expenseData = {
        event_id: eventId,
        description: description?.trim() || '', // Always include description, even if empty
        amount,
        currency,
        paid_by: paidByUserId,
        // Place fields: only include if it's a place expense
        place_name: isPlaceExpense
          ? manualPlaceName?.trim() || selectedPOI?.name || null
          : null,
        place_id: isPlaceExpense ? selectedPOI?.placeId || null : null,
        place_lat: isPlaceExpense ? selectedPOI?.lat || null : null,
        place_lon: isPlaceExpense ? selectedPOI?.lon || null : null,
        place_country: isPlaceExpense ? selectedPOI?.country || null : null,
        place_city: isPlaceExpense ? selectedPOI?.city || null : null,
        category: isPlaceExpense ? 'place' : 'general'
      };

      console.log('Final expense data:', expenseData);
      console.log(
        'Event currency:',
        eventDefaultCurrency,
        'Expense currency:',
        currency
      );

      // Currency conversion logic
      if (currency === eventDefaultCurrency) {
        // Same currency → direct save with conversion_rate = 1
        const { error } = await supabase.from('expenses').insert([
          {
            ...expenseData,
            conversion_rate_to_event_currency: 1
          }
        ]);

        if (error) {
          console.error('Error inserting expense:', error);
          toast.error(t('failed_create_expense'));
          setSaving(false);
          return;
        }

        toast.success(t('expense_created_successfully'));
        navigate(`/events/${eventId}`);
      } else {
        // Different currency → fetch conversion rate and show confirmation
        const rate = await fetchConversionRate(currency, eventDefaultCurrency);

        if (rate === null || isNaN(rate) || rate <= 0) {
          console.error('Invalid conversion rate:', rate);
          toast.error(
            'Failed to fetch valid conversion rate. Please try again.'
          );
          setSaving(false);
          return;
        }

        console.log('Fetched conversion rate:', rate);

        // Store data for confirmation dialog
        setConversionRate(rate);
        setPendingExpenseData(expenseData);
        setShowCurrencyConfirmation(true);
        // Note: setSaving(false) will be called in handleCurrencyConfirmation
      }
    } catch (err) {
      console.error('Unexpected error in handleSave:', err);
      toast.error(t('failed_create_expense'));
      setSaving(false);
    }
  };

  const handleCurrencyConfirmation = async (confirmed: boolean) => {
    setShowCurrencyConfirmation(false);

    if (!confirmed || !pendingExpenseData) {
      console.log('Currency confirmation canceled or no pending data.');
      setPendingExpenseData(null);
      setSaving(false);
      return;
    }

    // Safe conversion rate
    const safeRate =
      !isNaN(conversionRate) && conversionRate > 0 ? conversionRate : 1;

    console.log('Final insert with conversion rate:', safeRate);

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          ...pendingExpenseData,
          conversion_rate_to_event_currency: safeRate
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
      console.error('Unexpected error during confirmed insert:', err);
      toast.error(t('failed_create_expense'));
    } finally {
      setSaving(false);
      setPendingExpenseData(null);
    }
  };

  // Optimize styles with useMemo to prevent re-calculation - ALWAYS at the end
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
        gridTemplateColumns: '1fr 1fr',
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

      participantRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'white',
        fontSize: '14px',
        padding: '8px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        justifyContent: 'space-between'
      },

      participantLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
      },

      participantRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '120px'
      },

      shareInput: {
        width: '90px',
        padding: '10px 12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        fontSize: '14px',
        color: 'white',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        transition: 'all 0.3s ease',
        outline: 'none',
        textAlign: 'right' as const,
        boxSizing: 'border-box' as const,
        WebkitAppearance: 'none' as const,
        MozAppearance: 'textfield' as const,
        ':focus': {
          borderColor: '#00f5ff',
          boxShadow:
            '0 0 0 3px rgba(0, 245, 255, 0.1), 0 0 15px rgba(0, 245, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.08)',
          transform: 'scale(1.02)'
        }
      },

      shareInputDisabled: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        color: 'rgba(255, 255, 255, 0.4)',
        cursor: 'not-allowed'
      },

      shareDisplay: {
        minWidth: '80px',
        padding: '6px 8px',
        background: 'rgba(0, 245, 255, 0.1)',
        border: '1px solid rgba(0, 245, 255, 0.2)',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#00f5ff',
        textAlign: 'right' as const,
        fontWeight: '600'
      },

      currencyLabel: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        minWidth: '30px'
      },

      placeInputContainer: {
        position: 'relative' as const
      },

      autocompleteToggle: {
        marginTop: '8px',
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        color: '#00f5ff',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        userSelect: 'none' as const,
        display: 'inline-block'
      },

      placePreview: {
        marginTop: '8px',
        padding: '8px 12px',
        background: 'rgba(0, 245, 255, 0.1)',
        border: '1px solid rgba(0, 245, 255, 0.2)',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#00f5ff'
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

      // NEW: Currency confirmation dialog styles
      overlay: {
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

      dialog: {
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '24px',
        maxWidth: '400px',
        margin: '20px',
        color: 'white'
      },

      dialogTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '16px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      dialogMessage: {
        fontSize: '16px',
        lineHeight: '1.5',
        marginBottom: '24px',
        color: 'rgba(255, 255, 255, 0.9)'
      },

      dialogButtons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      },

      dialogButton: {
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: 'none',
        minWidth: '80px'
      },

      dialogButtonCancel: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      },

      dialogButtonConfirm: {
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white'
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
      },

      loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '16px'
      },

      loadingSpinner: {
        width: '20px',
        height: '20px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid #00f5ff',
        borderRadius: '50%',
        marginRight: '12px',
        animation: 'spin 1s linear infinite'
      },

      emptyState: {
        textAlign: 'center' as const,
        padding: '40px 20px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px'
      }
    }),
    [isOnline]
  );

  // Render minimal floating elements - ALWAYS at the end
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

  // Language selector - ALWAYS at the end
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

  // NEW: Currency confirmation dialog
  const CurrencyConfirmationDialog = useMemo(() => {
    if (!showCurrencyConfirmation) return null;

    return (
      <div style={styles.overlay}>
        <div style={styles.dialog}>
          <h3 style={styles.dialogTitle}>{t('currency_conversion_title')}</h3>
          <p style={styles.dialogMessage}>
            {t('currency_conversion_message', {
              currency,
              rate: conversionRate.toFixed(4),
              targetCurrency: eventDefaultCurrency
            })}
          </p>
          <div style={styles.dialogButtons}>
            <button
              style={{
                ...styles.dialogButton,
                ...styles.dialogButtonCancel
              }}
              onClick={() => handleCurrencyConfirmation(false)}
            >
              {t('cancel')}
            </button>
            <button
              style={{
                ...styles.dialogButton,
                ...styles.dialogButtonConfirm
              }}
              onClick={() => handleCurrencyConfirmation(true)}
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  }, [
    showCurrencyConfirmation,
    currency,
    conversionRate,
    eventDefaultCurrency,
    styles
  ]);

  // Global styles - ALWAYS at the end
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        /* Hide number input spinners completely */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  display: none;
}

/* Firefox spinner hiding */
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Additional focus enhancement for share inputs specifically */
input[type="number"]:focus {
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: none;
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

  // ✅ EARLY RETURNS AFTER ALL HOOKS - This prevents hooks order issues

  // Show loading state
  if (loading || participantsLoading) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        <div style={styles.addExpenseContainer}>
          <div style={styles.formContainer}>
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              {t('loading_participants')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no participants
  if (eventParticipants.length === 0) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        <div style={styles.addExpenseContainer}>
          <div style={styles.formContainer}>
            <div style={styles.header}>
              <button
                style={styles.backButton}
                onClick={() => navigate(`/events/${eventId}`)}
              >
                ← {t('back_to_home')}
              </button>
              <h1 style={styles.title}>{t('add_expense_button')}</h1>
            </div>
            <div style={styles.emptyState}>
              <p>{t('no_participants_found')}</p>
              <button
                style={styles.button}
                onClick={() => navigate(`/events/${eventId}`)}
              >
                {t('back_to_event')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN RENDER - Always happens after all hooks
  return (
    <div style={styles.container}>
      {GlobalStyles}
      {FloatingElements}

      {showOfflineMessage && (
        <div style={styles.offlineMessage}>📡 {t('offline_message')}</div>
      )}

      {LanguageSelector}

      {/* NEW: Currency confirmation dialog */}
      {CurrencyConfirmationDialog}

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
                <div style={styles.placeInputContainer}>
                  <GeoapifyAutocomplete
                    type="poi"
                    onSelect={(placeName, extraData) => {
                      console.log('EXTRA DATA:', extraData);

                      setSelectedPOI({
                        name: placeName,
                        placeId: '',
                        country: extraData?.country || '',
                        city: extraData?.city || '',
                        district: extraData?.district || '',
                        street: extraData?.street || '',
                        lat: extraData?.lat || 0,
                        lon: extraData?.lon || 0
                      });

                      const detailedName = [
                        placeName,
                        extraData?.city,
                        extraData?.district,
                        extraData?.street
                      ]
                        .filter(Boolean)
                        .join(' • ');

                      setManualPlaceName(detailedName);
                    }}
                    renderOption={(place) => {
                      console.log('PLACE:', place);
                      const name =
                        place.name ||
                        place.properties?.name ||
                        place.formatted ||
                        '';
                      const address = place.address || place.properties || {};

                      return (
                        <div
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <div style={{ fontWeight: 'bold', color: '#fff' }}>
                            {name}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'rgba(255, 255, 255, 0.5)',
                              marginTop: '2px'
                            }}
                          >
                            {[address.city, address.district, address.street]
                              .filter(Boolean)
                              .join(' • ')}
                          </div>
                        </div>
                      );
                    }}
                  />

                  {/* Selected POI Preview */}
                  {selectedPOI && (
                    <div style={styles.placePreview}>
                      📍 {selectedPOI.name}
                      {selectedPOI.city && ` • ${selectedPOI.city}`}
                      {selectedPOI.district && ` • ${selectedPOI.district}`}
                      {selectedPOI.street && ` • ${selectedPOI.street}`}
                      {selectedPOI.country && ` • ${selectedPOI.country}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                {t('expense_description_label')}
              </label>
              <input
                style={styles.input}
                type="text"
                placeholder={t('expense_description_label')}
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
                  type="text"
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
                {eventParticipants.map((user) => (
                  <div key={user.id} style={styles.participantRow}>
                    <div
                      style={styles.participantLeft}
                      onClick={() => {
                        if (participants.includes(user.id)) {
                          const newParticipants = participants.filter(
                            (id) => id !== user.id
                          );
                          setParticipants(newParticipants);

                          // Remove from shares
                          const newShares = { ...participantShares };
                          delete newShares[user.id];
                          setParticipantShares(newShares);
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
                          participants.includes(user.id)
                            ? 'checkbox-checked'
                            : ''
                        }
                      ></div>
                      <span>{user.name}</span>
                    </div>

                    {/* Show share amount if participant is selected - ALWAYS VISIBLE */}
                    {participants.includes(user.id) && (
                      <div style={styles.participantRight}>
                        {splitMethod === 'equal' ? (
                          // Equal split - show calculated amount (non-editable)
                          <div style={styles.shareDisplay}>
                            {amount && typeof amount === 'number'
                              ? (participantShares[user.id] || 0).toFixed(2)
                              : '0.00'}
                          </div>
                        ) : (
                          // Manual split - show editable input
                          <input
                            style={{
                              ...styles.shareInput,
                              ...(!amount || typeof amount !== 'number'
                                ? styles.shareInputDisabled
                                : {})
                            }}
                            type="number"
                            step="0.01"
                            min="0"
                            max={amount || 999999}
                            value={
                              amount && typeof amount === 'number'
                                ? (participantShares[user.id] || 0).toFixed(2)
                                : '0.00'
                            }
                            onChange={(e) => {
                              if (amount && typeof amount === 'number') {
                                const newValue =
                                  parseFloat(e.target.value) || 0;
                                handleShareChange(user.id, newValue);
                              }
                            }}
                            disabled={!amount || typeof amount !== 'number'}
                            onFocus={(e) => {
                              if (amount && typeof amount === 'number') {
                                e.target.style.borderColor = '#00f5ff';
                                e.target.style.boxShadow =
                                  '0 0 10px rgba(0, 245, 255, 0.2)';
                                e.target.style.background =
                                  'rgba(255, 255, 255, 0.08)';
                              }
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor =
                                'rgba(255, 255, 255, 0.1)';
                              e.target.style.boxShadow = 'none';
                              e.target.style.background =
                                'rgba(255, 255, 255, 0.05)';
                            }}
                          />
                        )}
                        <span style={styles.currencyLabel}>{currency}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Show total validation for manual split */}
              {splitMethod === 'manual' &&
                amount &&
                typeof amount === 'number' &&
                participants.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background:
                        Math.abs(
                          Object.values(participantShares).reduce(
                            (sum, share) => sum + (share || 0),
                            0
                          ) - amount
                        ) < 0.01
                          ? 'rgba(76, 175, 80, 0.1)'
                          : 'rgba(255, 193, 7, 0.1)',
                      border:
                        Math.abs(
                          Object.values(participantShares).reduce(
                            (sum, share) => sum + (share || 0),
                            0
                          ) - amount
                        ) < 0.01
                          ? '1px solid rgba(76, 175, 80, 0.3)'
                          : '1px solid rgba(255, 193, 7, 0.3)',
                      color:
                        Math.abs(
                          Object.values(participantShares).reduce(
                            (sum, share) => sum + (share || 0),
                            0
                          ) - amount
                        ) < 0.01
                          ? '#4CAF50'
                          : '#FFC107'
                    }}
                  >
                    Total:{' '}
                    {Object.values(participantShares)
                      .reduce((sum, share) => sum + (share || 0), 0)
                      .toFixed(2)}{' '}
                    {currency}
                    {Math.abs(
                      Object.values(participantShares).reduce(
                        (sum, share) => sum + (share || 0),
                        0
                      ) - amount
                    ) < 0.01
                      ? ' ✓'
                      : ` (Expected: ${amount.toFixed(2)} ${currency})`}
                  </div>
                )}
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
