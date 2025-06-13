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

  // ✅ Sadece kullanıcının katıldığı etkinlikleri yükle
  const loadUserEvents = async (userId: string) => {
    try {
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
            created_at
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user events:', error);
        toast.error(t('failed_load_events'));
        return;
      }

      // EventParticipant array'ını Event array'ına dönüştür
      const userEvents = data
        .filter((participant: EventParticipant) => participant.events) // events null değilse
        .map((participant: EventParticipant) => participant.events);

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

      eventTitle: {
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: '700',
        marginBottom: '8px'
      },

      eventInfo: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '13px',
        marginBottom: '4px'
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
          .events-content {
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

        {/* Events Content */}
        <div style={styles.eventsContent} className="events-content">
          {loading ? (
            <div style={styles.loading}>{t('loading_events')}</div>
          ) : events.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>🎉</div>
              <div style={styles.emptyStateText}>
                {t('no_events_participated')}
              </div>
              <button
                style={styles.createEventButton}
                onClick={() => navigate('/create-event')}
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
              {events.map((event) => (
                <div
                  key={event.id}
                  style={styles.eventCard}
                  onClick={() => navigate(`/events/${event.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={styles.eventTitle}>{event.name}</div>
                  <div style={styles.eventInfo}>
                    {t('event_category_label')}:{' '}
                    {t(`event_category_option_${event.category}`)}
                  </div>
                  <div style={styles.eventInfo}>
                    {t('event_date_label')}:{' '}
                    {formatDate(event.planned_start_date)}
                  </div>
                  <div style={styles.eventInfo}>
                    {t('event_duration_label')}:{' '}
                    {formatDuration(event.planned_duration_days)}
                  </div>
                  <div style={styles.eventInfo}>
                    {t('event_location_label')}: {event.place_country} -{' '}
                    {event.place_city}
                  </div>
                  <div style={styles.eventInfo}>
                    {t('default_currency_label')}: {event.default_currency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Events;
