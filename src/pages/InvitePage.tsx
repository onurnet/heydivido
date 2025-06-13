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
  place_country: string;
  place_city: string;
  planned_start_date: string | null;
  planned_duration_days: number | null;
}

interface Invitation {
  id: string;
  event_id: string;
  token: string;
  status: string;
  expires_at: string;
  created_by: string;
  created_at: string;
}

const InvitationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (token) {
      loadInvitationDetails();
      checkCurrentUser();
    }
  }, [token]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const checkCurrentUser = async () => {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  const loadInvitationDetails = async () => {
    try {
      setLoading(true);

      // Davetiye bilgilerini yükle
      const { data: invitationData, error: invitationError } = await supabase
        .from('event_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (invitationError || !invitationData) {
        console.error('Invitation not found:', invitationError);
        toast.error(t('invitation_not_found'));
        return;
      }

      // Davetiyenin süresi dolmuş mu kontrol et
      const now = new Date();
      const expiresAt = new Date(invitationData.expires_at);

      if (expiresAt < now) {
        setIsExpired(true);
        toast.error(t('invitation_expired'));
        return;
      }

      setInvitation(invitationData);

      // Etkinlik bilgilerini yükle
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', invitationData.event_id)
        .single();

      if (eventError || !eventData) {
        console.error('Event not found:', eventError);
        toast.error(t('event_not_found'));
        return;
      }

      setEvent(eventData);
    } catch (err) {
      console.error('Error loading invitation:', err);
      toast.error(t('failed_load_invitation'));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!currentUser) {
      // Kullanıcı giriş yapmamış, önce giriş yapsın
      toast.error(t('please_login_first'));
      navigate('/login', { state: { returnUrl: `/invite/${token}` } });
      return;
    }

    if (!invitation || !event) {
      toast.error(t('invalid_invitation'));
      return;
    }

    try {
      setIsProcessing(true);

      // Kullanıcı zaten katılımcı mı kontrol et
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', currentUser.id)
        .single();

      if (existingParticipant) {
        toast.success(t('already_participant'));
        navigate(`/events/${event.id}`);
        return;
      }

      // Kullanıcıyı etkinliğe katılımcı olarak ekle
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert([
          {
            event_id: event.id,
            user_id: currentUser.id,
            role: 'participant',
            status: 'active',
            joined_at: new Date().toISOString()
          }
        ]);

      if (participantError) {
        console.error('Error adding participant:', participantError);
        toast.error(t('failed_join_event'));
        return;
      }

      // Davetiyeyi kullanılmış olarak işaretle
      const { error: invitationUpdateError } = await supabase
        .from('event_invitations')
        .update({
          status: 'used',
          used_by: currentUser.id,
          used_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (invitationUpdateError) {
        console.error('Error updating invitation:', invitationUpdateError);
        // Bu hata kritik değil, katılım başarılı
      }

      toast.success(t('successfully_joined_event'));
      navigate(`/events/${event.id}`);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast.error(t('failed_join_event'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvitation = () => {
    toast.info(t('invitation_declined'));
    navigate('/');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('not_specified');
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (days: number | null) => {
    if (!days) return t('not_specified');
    return `${days} ${days === 1 ? t('day') : t('days')}`;
  };

  // Optimize styles with useMemo
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
          'env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 20px) env(safe-area-inset-left, 20px)',
        position: 'relative' as const
      },

      floatingElement: {
        position: 'absolute' as const,
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 12s ease-in-out infinite',
        pointerEvents: 'none' as const
      },

      invitationCard: {
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '32px',
        position: 'relative' as const,
        zIndex: 2,
        textAlign: 'center' as const
      },

      header: {
        marginBottom: '24px'
      },

      icon: {
        fontSize: '4rem',
        marginBottom: '16px',
        display: 'block',
        filter: 'drop-shadow(0 0 20px rgba(0, 245, 255, 0.5))'
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

      subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1.1rem',
        marginBottom: '8px'
      },

      eventName: {
        color: '#00f5ff',
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '24px'
      },

      eventDetails: {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      },

      detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        textAlign: 'center' as const
      },

      detailItem: {
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      },

      detailLabel: {
        color: '#00f5ff',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '6px',
        textTransform: 'uppercase' as const
      },

      detailValue: {
        color: 'white',
        fontSize: '14px',
        fontWeight: '500'
      },

      description: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '15px',
        lineHeight: '1.6',
        marginBottom: '32px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      },

      buttons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap' as const
      },

      primaryButton: {
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: '140px',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      secondaryButton: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: '140px',
        backdropFilter: 'blur(10px)',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      loading: {
        textAlign: 'center' as const,
        color: '#00f5ff',
        fontSize: '18px',
        padding: '60px 20px'
      },

      errorState: {
        textAlign: 'center' as const,
        color: '#ff6b6b',
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
      }
    }),
    []
  );

  // Floating elements
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
            background: 'rgba(0, 245, 255, 0.08)',
            animationDelay: '0s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            bottom: '15%',
            right: '10%',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 0, 110, 0.08)',
            animationDelay: '6s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            top: '60%',
            left: '5%',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 200, 0, 0.06)',
            animationDelay: '3s'
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
        
        html, body {
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @media (max-width: 768px) {
          .invitation-card {
            margin: 16px !important;
            padding: 24px !important;
            max-width: calc(100% - 32px) !important;
          }
          .details-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .buttons {
            flex-direction: column !important;
            align-items: center !important;
          }
          .primary-button,
          .secondary-button {
            width: 100% !important;
            max-width: 280px !important;
          }
          .title {
            font-size: 1.6rem !important;
          }
          .event-name {
            font-size: 1.1rem !important;
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
          .invitation-card {
            padding: 20px !important;
          }
          .title {
            font-size: 1.4rem !important;
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
        <div style={styles.invitationCard}>
          <div style={styles.loading}>
            <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              🔄 {t('loading_invitation')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired || !invitation || !event) {
    return (
      <div style={styles.container}>
        {GlobalStyles}
        {FloatingElements}
        {LanguageSelector}
        <div style={styles.invitationCard}>
          <button
            style={styles.backButton}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ← {t('back_to_home')}
          </button>
          <div style={styles.errorState}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
            <div>
              {isExpired ? t('invitation_expired') : t('invitation_not_found')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {GlobalStyles}
      {FloatingElements}
      {LanguageSelector}

      <div style={styles.invitationCard} className="invitation-card">
        <button
          style={styles.backButton}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ← {t('back_to_home')}
        </button>

        <div style={styles.header}>
          <div style={styles.icon}>🎉</div>
          <h1 style={styles.title} className="title">
            {t('event_invitation')}
          </h1>
          <p style={styles.subtitle}>{t('youve_been_invited_to')}</p>
          <div style={styles.eventName} className="event-name">
            {event.name}
          </div>
        </div>

        {event.description && (
          <div style={styles.description}>{event.description}</div>
        )}

        <div style={styles.eventDetails}>
          <div style={styles.detailsGrid} className="details-grid">
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('event_date_label')}</div>
              <div style={styles.detailValue}>
                {formatDate(event.planned_start_date)}
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('event_duration_label')}</div>
              <div style={styles.detailValue}>
                {formatDuration(event.planned_duration_days)}
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>{t('event_location_label')}</div>
              <div style={styles.detailValue}>
                {event.place_country} - {event.place_city}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.buttons} className="buttons">
          <button
            style={styles.primaryButton}
            className="primary-button"
            onClick={handleAcceptInvitation}
            disabled={isProcessing}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 10px 30px rgba(0, 245, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isProcessing
              ? '⏳ ' + t('processing')
              : '✅ ' + t('accept_invitation')}
          </button>
          <button
            style={styles.secondaryButton}
            className="secondary-button"
            onClick={handleDeclineInvitation}
            disabled={isProcessing}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ❌ {t('decline_invitation')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
