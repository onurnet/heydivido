import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  created_at: string;
  status: 'active' | 'passive' | 'deleted';
}

interface EventParticipant {
  event_id: string;
  role: string;
  status: string;
  events: Event;
}

const Events: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ Filter state for passive events
  const [showPassiveEvents, setShowPassiveEvents] = useState(false);

  // network monitoring
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

  // check user and load events
  useEffect(() => {
    checkUserAndLoadEvents();
  }, []);

  // ✅ Reload events when filter changes
  useEffect(() => {
    if (currentUser) {
      loadUserEvents(currentUser.id);
    }
  }, [showPassiveEvents]);

  const checkUserAndLoadEvents = async () => {
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
      await loadUserEvents(user.id);
    } catch (err) {
      console.error('Error checking user:', err);
      toast.error(t('authentication_failed'));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated to filter by status and include status field
  const loadUserEvents = async (userId: string) => {
    try {
      // Status filter based on checkbox
      const statusFilter = showPassiveEvents
        ? ['active', 'passive']
        : ['active'];

      // event_participants tablosundan kullanıcının katıldığı etkinlikleri al
      const { data, error } = await supabase
        .from('event_participants')
        .select(
          `
          event_id,
          role,
          status,
          events (
            id,
            name,
            description,
            category,
            default_currency,
            place_country,
            place_city,
            planned_start_date,
            planned_duration_days,
            created_at,
            status
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'active') // participant status must be active
        .in('events.status', statusFilter); // filter events by status

      if (error) {
        console.error('Error loading user events:', error);
        toast.error(t('failed_load_events'));
        return;
      }

      // EventParticipant array'ını Event array'ına dönüştür
      const userEvents = data
        .filter(
          (participant: EventParticipant) =>
            participant.events && participant.events.status !== 'deleted' // Extra safety: never show deleted
        )
        .map((participant: EventParticipant) => participant.events)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setEvents(userEvents);
    } catch (err) {
      console.error('Error loading user events:', err);
      toast.error(t('failed_load_events'));
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('not_specified');
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (days: number | null) => {
    if (!days) return t('not_specified');
    return `${days} ${days === 1 ? t('day') : t('days')}`;
  };

  // ✅ Filter events by status for display
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.status === 'deleted') return false; // Never show deleted
      if (!showPassiveEvents && event.status === 'passive') return false;
      return true;
    });
  }, [events, showPassiveEvents]);

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

      eventsContainer: {
        width: '100%',
        maxWidth: '800px',
        position: 'relative' as const,
        zIndex: 2
      },

      header: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '24px',
        marginBottom: '20px',
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

      headerTitle: {
        fontSize: '2rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '8px',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      },

      headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        marginTop: '8px'
      },

      // ✅ Filter section styles
      filterSection: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        marginBottom: '20px'
      },

      filterContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      },

      checkboxContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      checkbox: {
        appearance: 'none' as const,
        WebkitAppearance: 'none' as const,
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        background: 'rgba(255, 255, 255, 0.05)',
        position: 'relative' as const,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none'
      },

      checkboxChecked: {
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        borderColor: '#00f5ff'
      },

      checkboxLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer'
      },

      eventsContent: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '24px'
      },

      eventsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      },

      eventCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative' as const
      },

      // ✅ Passive event card styles
      eventCardPassive: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        opacity: 0.6
      },

      eventTitle: {
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: '700',
        marginBottom: '8px'
      },

      // ✅ Passive event title styles
      eventTitlePassive: {
        color: 'rgba(255, 255, 255, 0.6)'
      },

      eventInfo: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '13px',
        marginBottom: '4px'
      },

      // ✅ Passive event info styles
      eventInfoPassive: {
        color: 'rgba(255, 255, 255, 0.4)'
      },

      // ✅ Status badge
      statusBadge: {
        position: 'absolute' as const,
        top: '12px',
        right: '12px',
        background: 'rgba(255, 165, 0, 0.2)',
        color: '#ffa500',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: '600',
        textTransform: 'uppercase' as const
      },

      emptyState: {
        textAlign: 'center' as const,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '16px',
        padding: '40px 20px'
      },

      emptyStateIcon: {
        fontSize: '3rem',
        marginBottom: '16px',
        display: 'block'
      },

      emptyStateText: {
        marginBottom: '16px',
        lineHeight: '1.5'
      },

      createEventButton: {
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      loading: {
        textAlign: 'center' as const,
        color: '#00f5ff',
        fontSize: '18px',
        padding: '40px 20px'
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

        /* ✅ Checkbox checkmark */
        input[type="checkbox"]:checked::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .events-container {
            padding: 16px !important;
            max-width: 100% !important;
          }
          .events-list {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .header {
            padding: 20px !important;
          }
          .events-content {
            padding: 20px !important;
          }
          .filter-section {
            padding: 16px !important;
          }
          .header-title {
            font-size: 1.75rem !important;
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
          .header-title {
            font-size: 1.5rem !important;
          }
          .filter-container {
            flex-direction: column !important;
            gap: 8px !important;
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
          .events-content,
          .filter-section {
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
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

      <div style={styles.eventsContainer} className="events-container">
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
          <h1 style={styles.headerTitle} className="header-title">
            {t('my_events_title')}
          </h1>
          <p style={styles.headerSubtitle}>{t('events_you_participate_in')}</p>
        </div>

        {/* ✅ Filter Section */}
        <div style={styles.filterSection} className="filter-section">
          <div style={styles.filterContainer} className="filter-container">
            <div
              style={styles.checkboxContainer}
              onClick={() => setShowPassiveEvents(!showPassiveEvents)}
            >
              <input
                type="checkbox"
                checked={showPassiveEvents}
                onChange={(e) => setShowPassiveEvents(e.target.checked)}
                style={{
                  ...styles.checkbox,
                  ...(showPassiveEvents ? styles.checkboxChecked : {})
                }}
              />
              <label style={styles.checkboxLabel}>
                {t('show_passive_events')}
              </label>
            </div>
          </div>
        </div>

        {/* Events Content */}
        <div style={styles.eventsContent} className="events-content">
          {loading ? (
            <div style={styles.loading}>{t('loading_events')}</div>
          ) : filteredEvents.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>🎉</div>
              <div style={styles.emptyStateText}>
                {showPassiveEvents
                  ? t('no_events_found_with_filter')
                  : t('no_events_participated')}
              </div>
              <button
                style={styles.createEventButton}
                onClick={() => navigate('/add-event')}
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
                {t('create_first_event')}
              </button>
            </div>
          ) : (
            <div style={styles.eventsList} className="events-list">
              {filteredEvents.map((event) => {
                const isPassive = event.status === 'passive';

                return (
                  <div
                    key={event.id}
                    style={{
                      ...styles.eventCard,
                      ...(isPassive ? styles.eventCardPassive : {})
                    }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    onMouseEnter={(e) => {
                      if (isPassive) {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      } else {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isPassive) {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.02)';
                      } else {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.05)';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* ✅ Status badge for passive events */}
                    {isPassive && (
                      <div style={styles.statusBadge}>
                        {t('status_passive')}
                      </div>
                    )}

                    <div
                      style={{
                        ...styles.eventTitle,
                        ...(isPassive ? styles.eventTitlePassive : {})
                      }}
                    >
                      {event.name}
                    </div>

                    <div
                      style={{
                        ...styles.eventInfo,
                        ...(isPassive ? styles.eventInfoPassive : {})
                      }}
                    >
                      {t('event_category_label')}:{' '}
                      {t(`event_category_option_${event.category}`)}
                    </div>

                    <div
                      style={{
                        ...styles.eventInfo,
                        ...(isPassive ? styles.eventInfoPassive : {})
                      }}
                    >
                      {t('event_date_label')}:{' '}
                      {formatDate(event.planned_start_date)}
                    </div>

                    <div
                      style={{
                        ...styles.eventInfo,
                        ...(isPassive ? styles.eventInfoPassive : {})
                      }}
                    >
                      {t('event_duration_label')}:{' '}
                      {formatDuration(event.planned_duration_days)}
                    </div>

                    <div
                      style={{
                        ...styles.eventInfo,
                        ...(isPassive ? styles.eventInfoPassive : {})
                      }}
                    >
                      {t('event_location_label')}: {event.place_country} -{' '}
                      {event.place_city}
                    </div>

                    <div
                      style={{
                        ...styles.eventInfo,
                        ...(isPassive ? styles.eventInfoPassive : {})
                      }}
                    >
                      {t('default_currency_label')}: {event.default_currency}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Events;
