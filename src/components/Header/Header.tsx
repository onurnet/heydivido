// src/components/Header/Header.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  auth_user_id?: string;
  divido_no?: string;
  gezgin_no?: string;
}

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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

  const displayName = useMemo(() => {
    // 1. tercih: user.name varsa
    if (user.name && user.name.trim()) {
      return user.name.trim();
    }

    // 2. tercih: e-mail'den username çıkar
    if (user.email) {
      const emailParts = user.email.split('@');
      if (emailParts.length === 2 && emailParts[0].trim()) {
        return emailParts[0].trim();
      }
    }

    return 'User';
  }, [user]);

  // Get Divido number from database or generate fallback
  const dividoNumber = useMemo(() => {
    // Try to get from database first
    if (user.divido_no) {
      return user.divido_no.startsWith('#')
        ? user.divido_no
        : `#${user.divido_no}`;
    }

    if (user.gezgin_no) {
      return user.gezgin_no.startsWith('#')
        ? user.gezgin_no
        : `#${user.gezgin_no}`;
    }

    // Fallback: generate from user ID if no number in DB
    const baseId = user.auth_user_id || user.id || '';
    if (!baseId) return '#DV000000';

    let hash = 0;
    for (let i = 0; i < baseId.length; i++) {
      const char = baseId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const positiveHash = Math.abs(hash);
    const shortNumber = positiveHash.toString().slice(-6).padStart(6, '0');
    return `#DV${shortNumber}`;
  }, [user.divido_no, user.gezgin_no, user.id, user.auth_user_id]);

  const timeString = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const styles = useMemo(
    () => ({
      header: {
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        color: 'white',
        padding: 'env(safe-area-inset-top, 20px) 20px 30px 20px',
        borderRadius: '0 0 25px 25px',
        position: 'relative' as const,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: 'none'
      },

      floatingElement: {
        position: 'absolute' as const,
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 15s ease-in-out infinite',
        pointerEvents: 'none' as const,
        zIndex: 1
      },

      headerContent: {
        position: 'relative' as const,
        zIndex: 2
      },

      headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      },

      greetingSection: {
        flex: 1
      },

      greeting: {
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontWeight: '700',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '4px'
      },

      locationTime: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        opacity: 0.8,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '400'
      },

      locationIcon: {
        fontSize: '12px',
        color: '#00f5ff'
      },

      headerActions: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        alignItems: 'flex-end'
      },

      languageSelector: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '4px 6px',
        display: 'flex',
        gap: '4px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      },

      languageButton: {
        background: 'transparent',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '11px',
        fontWeight: '600',
        padding: '4px 8px',
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

      walletButton: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'rgba(255, 255, 255, 0.6)',
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '11px',
        fontWeight: '500',
        backdropFilter: 'blur(10px)',
        cursor: 'not-allowed',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      },

      dividoSection: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative' as const
      },

      dividoLeft: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2px'
      },

      dividoLabel: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500'
      },

      dividoNumber: {
        fontSize: '18px',
        fontWeight: '700',
        background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '0.5px'
      },

      copyButton: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'rgba(255, 255, 255, 0.8)',
        padding: '8px 16px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      },

      copyButtonHover: {
        background: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }
    }),
    [isOnline]
  );

  const handleCopyDividoNumber = async () => {
    try {
      await navigator.clipboard.writeText(dividoNumber.replace('#', ''));
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Floating background elements
  const FloatingElements = useMemo(
    () => (
      <>
        <div
          style={{
            ...styles.floatingElement,
            top: '10%',
            left: '10%',
            width: '100px',
            height: '100px',
            background: 'rgba(0, 245, 255, 0.1)',
            animationDelay: '0s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            bottom: '15%',
            right: '15%',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 0, 110, 0.1)',
            animationDelay: '8s'
          }}
        />
      </>
    ),
    [styles.floatingElement]
  );

  const GlobalStyles = useMemo(
    () => (
      <style>
        {`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(8px) rotate(-1deg); }
        }

        @media (max-width: 768px) {
          .header-top {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: flex-start !important;
          }
          
          .header-actions {
            align-self: flex-end !important;
            flex-direction: row !important;
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .divido-section {
            padding: 12px 16px !important;
          }
          
          .greeting {
            font-size: 1.5rem !important;
          }
          
          .divido-number {
            font-size: 16px !important;
          }
        }
      `}
      </style>
    ),
    []
  );

  return (
    <>
      {GlobalStyles}
      <header style={styles.header}>
        {FloatingElements}

        <div style={styles.headerContent}>
          <div style={styles.headerTop} className="header-top">
            <div style={styles.greetingSection}>
              <div style={styles.greeting}>
                {t('greeting', { name: displayName })}
              </div>
              <div style={styles.locationTime}>
                <span style={styles.locationIcon}>📍</span>
                <span>İstanbul, TR</span>
                <span>•</span>
                <span>{timeString}</span>
              </div>
            </div>

            <div style={styles.headerActions} className="header-actions">
              {/* Language Selector */}
              <div style={styles.languageSelector}>
                <button
                  style={{
                    ...styles.languageButton,
                    ...(i18n.language === 'tr'
                      ? styles.languageButtonActive
                      : {})
                  }}
                  onClick={() => changeLanguage('tr')}
                >
                  TR
                </button>
                <button
                  style={{
                    ...styles.languageButton,
                    ...(i18n.language === 'en'
                      ? styles.languageButtonActive
                      : {})
                  }}
                  onClick={() => changeLanguage('en')}
                >
                  EN
                </button>
              </div>

              {/* Wallet Button */}
              <button style={styles.walletButton}>
                <span>💳</span>
                <span>{t('wallet_soon')}</span>
              </button>
            </div>
          </div>

          {/* Divido Number Section */}
          <div style={styles.dividoSection} className="divido-section">
            <div style={styles.dividoLeft}>
              <div style={styles.dividoLabel}>Divido No</div>
              <div style={styles.dividoNumber} className="divido-number">
                {dividoNumber}
              </div>
            </div>
            <button
              style={styles.copyButton}
              onClick={handleCopyDividoNumber}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.copyButtonHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {t('copy') || 'Kopyala'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
