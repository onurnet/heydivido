import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import GeoapifyAutocomplete from '../components/GeoapifyAutocomplete/GeoapifyAutocomplete';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';

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

interface EventParticipant {
  id: string;
  user_id: string;
  role: 'admin' | 'participant';
  status: string;
  joined_at: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
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

const EventDetailsEdit: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedDurationDays, setPlannedDurationDays] = useState<number | ''>(
    ''
  );

  // ✅ Katılımcı listesi için state
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [removingParticipant, setRemovingParticipant] = useState<string | null>(
    null
  );

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

  useEffect(() => {
    if (eventId) {
      checkUserAndLoadData();
    }
  }, [eventId]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // ✅ Kullanıcı kontrolü ve veri yükleme
  const checkUserAndLoadData = async () => {
    try {
      setLoading(true);

      // Kullanıcı kimlik kontrolü
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Auth error:', authError);
        toast.error(t('user_not_authenticated'));
        navigate('/login');
        return;
      }

      setCurrentUser(user);

      // Kullanıcının bu etkinlikte admin yetkisi var mı kontrol et
      const { data: participantData, error: participantError } = await supabase
        .from('event_participants')
        .select('role')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (
        participantError ||
        !participantData ||
        participantData.role !== 'admin'
      ) {
        toast.error(t('only_admin_can_edit'));
        navigate(`/events/${eventId}`);
        return;
      }

      setIsAdmin(true);
      await loadEvent();
      await loadParticipants();
    } catch (err) {
      console.error('Error checking user:', err);
      toast.error(t('authentication_failed'));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadEvent = async () => {
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

      setName(data.name || '');
      setDescription(data.description || '');
      setCategory(data.category || '');
      setCountry(data.place_country || '');
      setCity(data.place_city || '');
      setPlannedStartDate(data.planned_start_date || '');
      setPlannedDurationDays(data.planned_duration_days || '');
    } catch (err) {
      console.error('Error loading event:', err);
      toast.error(t('failed_load_event'));
    }
  };

  // ✅ Katılımcıları yükle
  const loadParticipants = async () => {
    try {
      // Önce participants'ları yükle
      const { data: participantsData, error: participantsError } =
        await supabase
          .from('event_participants')
          .select('id, user_id, role, status, joined_at')
          .eq('event_id', eventId)
          .eq('status', 'active')
          .order('joined_at', { ascending: true });

      if (participantsError) {
        console.error('Error loading participants:', participantsError);
        toast.error(t('failed_load_participants'));
        return;
      }

      if (!participantsData || participantsData.length === 0) {
        setParticipants([]);
        return;
      }

      // Sonra her participant için user bilgilerini yükle
      const participantsWithUsers = await Promise.all(
        participantsData.map(async (participant) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('first_name, last_name, email')
            .eq('auth_user_id', participant.user_id)
            .single();

          return {
            ...participant,
            users: userData || {
              first_name: '',
              last_name: '',
              email: 'Unknown User'
            }
          };
        })
      );

      setParticipants(participantsWithUsers);
    } catch (err) {
      console.error('Error loading participants:', err);
      toast.error(t('failed_load_participants'));
    }
  };

  // ✅ Katılımcı çıkar
  const handleRemoveParticipant = async (
    participantId: string,
    participantUserId: string
  ) => {
    if (!currentUser || participantUserId === currentUser.id) {
      toast.error(t('cannot_remove_yourself'));
      return;
    }

    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;

    const userName =
      `${participant.users.first_name} ${participant.users.last_name}`.trim();

    // Onay iste
    if (!window.confirm(t('confirm_remove_participant', { name: userName }))) {
      return;
    }

    try {
      setRemovingParticipant(participantId);

      const { error } = await supabase
        .from('event_participants')
        .update({ status: 'removed' })
        .eq('id', participantId);

      if (error) {
        console.error('Error removing participant:', error);
        toast.error(t('failed_remove_participant'));
        return;
      }

      toast.success(t('participant_removed_successfully'));
      await loadParticipants(); // Listeyi yenile
    } catch (err) {
      console.error('Error removing participant:', err);
      toast.error(t('failed_remove_participant'));
    } finally {
      setRemovingParticipant(null);
    }
  };

  const handleSave = async () => {
    if (!name || !category || !country || !city) {
      toast.error(t('fill_required_fields'));
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('events')
        .update({
          name,
          description,
          category,
          place_country: country,
          place_city: city,
          planned_start_date: plannedStartDate || null,
          planned_duration_days: plannedDurationDays || null
        })
        .eq('id', eventId);

      if (error) {
        console.error('Error updating event:', error);
        toast.error(t('failed_update_event'));
        return;
      }

      toast.success(t('event_updated_successfully'));
      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error(t('failed_update_event'));
    } finally {
      setSaving(false);
    }
  };

  // ✅ Etkinliği sil (status = deleted)
  const handleDeleteEvent = async () => {
    if (!window.confirm(t('confirm_delete_event'))) {
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('events')
        .update({ status: 'deleted' })
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        toast.error(t('failed_delete_event'));
        return;
      }

      toast.success(t('event_deleted_successfully'));
      navigate('/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error(t('failed_delete_event'));
    } finally {
      setSaving(false);
    }
  };

  // ✅ Etkinliği pasif yap (status = passive)
  const handleMakePassive = async () => {
    if (!window.confirm(t('confirm_make_passive_event'))) {
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('events')
        .update({ status: 'passive' })
        .eq('id', eventId);

      if (error) {
        console.error('Error making event passive:', error);
        toast.error(t('failed_make_passive_event'));
        return;
      }

      toast.success(t('event_made_passive_successfully'));
      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error('Error making event passive:', err);
      toast.error(t('failed_make_passive_event'));
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

      editEventContainer: {
        width: '100%',
        maxWidth: '600px',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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

      textarea: {
        width: '100%',
        padding: '14px',
        minHeight: '80px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
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

      // ✅ Katılımcı listesi stilleri
      participantsSection: {
        marginTop: '32px',
        marginBottom: '24px'
      },

      sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: 'white',
        marginBottom: '16px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      participantsList: {
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      },

      participantItem: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease',
        gap: '12px',
        minHeight: '60px'
      },

      participantInfo: {
        flex: 1,
        minWidth: 0, // Important for text truncation
        overflow: 'hidden'
      },

      participantName: {
        color: 'white',
        fontSize: '15px',
        fontWeight: '600',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const
      },

      participantDetails: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '13px',
        lineHeight: '1.4',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const
      },

      participantActions: {
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0
      },

      participantRole: {
        background: 'rgba(255, 107, 107, 0.2)',
        color: '#ff6b6b',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const
      },

      removeButton: {
        background: 'rgba(255, 107, 107, 0.2)',
        color: '#ff6b6b',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap' as const,
        minWidth: '70px'
      },

      removeButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
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
        marginBottom: '12px',
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

      // ✅ Status butonları
      statusButtons: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '24px'
      },

      deleteButton: {
        background: 'linear-gradient(45deg, #ff6b6b, #ff3333)',
        color: 'white'
      },

      passiveButton: {
        background: 'linear-gradient(45deg, #ffa500, #ff8c00)',
        color: 'white'
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
          .edit-event-container {
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
          .status-buttons {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
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
          /* Participant responsive styles */
          .participant-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 16px !important;
          }
          .participant-info {
            width: 100% !important;
            margin-bottom: 8px !important;
          }
          .participant-actions {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-end !important;
            width: auto !important;
            gap: 8px !important;
          }
          .participant-name {
            font-size: 14px !important;
            white-space: normal !important;
            line-height: 1.3 !important;
          }
          .participant-details {
            white-space: normal !important;
            line-height: 1.4 !important;
            font-size: 12px !important;
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

  if (loading) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        {FloatingElements}
        {LanguageSelector}
        <div style={styles.editEventContainer}>
          <div style={styles.loading}>{t('loading_event_details')}</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        {FloatingElements}
        {LanguageSelector}
        <div style={styles.editEventContainer}>
          <div style={styles.loading}>{t('only_admin_can_edit')}</div>
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

      <div style={styles.editEventContainer} className="edit-event-container">
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
              ← {t('back_to_event')}
            </button>
            <h1 style={styles.title} className="title">
              {t('edit_event_button')}
            </h1>
          </div>

          <div style={styles.content} className="content">
            {/* Event Name */}
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

            {/* ✅ Event Description */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('event_description_label')}</label>
              <textarea
                style={styles.textarea}
                placeholder={t('event_description_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) =>
                  Object.assign(e.target.style, styles.inputFocus)
                }
                onBlur={(e) => Object.assign(e.target.style, styles.textarea)}
              />
            </div>

            {/* Event Category */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('event_category_label')}</label>
              <CustomDropdown
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                placeholder={t('event_category_label')}
              />
            </div>

            {/* Location */}
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

            {/* Date and Duration */}
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

            {/* ✅ Katılımcı Listesi */}
            <div style={styles.participantsSection}>
              <h3 style={styles.sectionTitle}>{t('event_participants')}</h3>

              {participants.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.6)',
                    padding: '20px'
                  }}
                >
                  {t('no_participants_yet')}
                </div>
              ) : (
                <div style={styles.participantsList}>
                  {participants.map((participant, index) => {
                    const isCurrentUser =
                      participant.user_id === currentUser?.id;
                    const userName =
                      `${participant.users.first_name} ${participant.users.last_name}`.trim();

                    return (
                      <div
                        key={participant.id}
                        style={{
                          ...styles.participantItem,
                          ...(index === participants.length - 1
                            ? { borderBottom: 'none' }
                            : {})
                        }}
                      >
                        <div style={styles.participantInfo}>
                          <div style={styles.participantName}>
                            {userName || participant.users.email}
                          </div>
                          <div style={styles.participantDetails}>
                            {participant.users.email}
                          </div>
                        </div>

                        <div style={styles.participantActions}>
                          {/* ✅ Sadece admin role'ü göster */}
                          {participant.role === 'admin' && (
                            <span style={styles.participantRole}>
                              {t('role_admin')}
                            </span>
                          )}

                          {!isCurrentUser && (
                            <button
                              style={{
                                ...styles.removeButton,
                                ...(removingParticipant === participant.id
                                  ? styles.removeButtonDisabled
                                  : {})
                              }}
                              onClick={() =>
                                handleRemoveParticipant(
                                  participant.id,
                                  participant.user_id
                                )
                              }
                              disabled={removingParticipant === participant.id}
                              onMouseEnter={(e) => {
                                if (removingParticipant !== participant.id) {
                                  e.currentTarget.style.background =
                                    'rgba(255, 107, 107, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  'rgba(255, 107, 107, 0.2)';
                              }}
                            >
                              {removingParticipant === participant.id
                                ? t('removing')
                                : t('remove')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
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

            {/* ✅ Status Butonları */}
            <div style={styles.statusButtons} className="status-buttons">
              <button
                style={{
                  ...styles.button,
                  ...styles.passiveButton,
                  ...(saving ? styles.buttonDisabled : {}),
                  marginBottom: 0
                }}
                onClick={handleMakePassive}
                disabled={saving}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 10px 30px rgba(255, 165, 0, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {t('make_passive_button')}
              </button>

              <button
                style={{
                  ...styles.button,
                  ...styles.deleteButton,
                  ...(saving ? styles.buttonDisabled : {}),
                  marginBottom: 0
                }}
                onClick={handleDeleteEvent}
                disabled={saving}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 10px 30px rgba(255, 107, 107, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {t('delete_event_button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default EventDetailsEdit;
