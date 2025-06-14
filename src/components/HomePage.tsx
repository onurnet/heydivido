// src/components/HomePage.tsx
import BottomNavigation from './BottomNavigation/BottomNavigation';
import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header/Header';
import FinancialSummary from './FinancialSummary/FinancialSummary';
import PersonalStats from './PersonalStats/PersonalStats';
import type { User, Summary, Event, Expense } from '../types/types';

interface HomePageProps {
  user: User | null;
  summary: Summary;
  events: Event[];
  expenses: Expense[];
}

const HomePage: React.FC<HomePageProps> = ({
  user,
  summary,
  events,
  expenses
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Güvenli kontrol: eksik veri varsa gösterme
  if (!user || !Array.isArray(events) || !Array.isArray(expenses)) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.spinner}></div>
        <div style={loadingStyles.text}>Yükleniyor...</div>
      </div>
    );
  }

  useEffect(() => {
    console.log('🔍 HomePage received props:', {
      user: user?.id,
      summary,
      eventsCount: events.length,
      expensesCount: expenses.length
    });
  }, [user, summary, events, expenses]);

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
          'env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) 100px env(safe-area-inset-left, 20px)',
        position: 'relative' as const,
        overflow: 'hidden'
      },

      floatingElement: {
        position: 'absolute' as const,
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 12s ease-in-out infinite',
        pointerEvents: 'none' as const
      },

      mainContainer: {
        width: '100%',
        maxWidth: '1000px',
        position: 'relative' as const,
        zIndex: 2
      },

      contentWrapper: {
        background: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        position: 'relative' as const
      },

      headerSection: {
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      },

      contentSection: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px'
      },

      sectionBlock: {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        position: 'relative' as const
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

  const loadingStyles = useMemo(
    () => ({
      container: {
        minHeight: '100vh',
        minHeight: '100dvh',
        width: '100%',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      },
      spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTop: '3px solid #00f5ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      },
      text: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '16px',
        fontWeight: '500'
      }
    }),
    []
  );

  // Floating background elements
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
        <div
          style={{
            ...styles.floatingElement,
            top: '60%',
            left: '5%',
            width: '100px',
            height: '100px',
            background: 'rgba(131, 56, 236, 0.08)',
            animationDelay: '3s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            top: '30%',
            right: '25%',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 193, 7, 0.08)',
            animationDelay: '9s'
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

        /* PWA-style scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 245, 255, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 245, 255, 0.5);
        }

        @media (max-width: 768px) {
          .homepage-container {
            padding: 16px !important;
          }
          
          .content-wrapper {
            border-radius: 16px !important;
          }
          
          .content-section {
            padding: 20px !important;
            gap: 20px !important;
          }
          
          .section-block {
            padding: 20px !important;
          }
        }

        @media (max-width: 480px) {
          .homepage-container {
            padding: 12px !important;
          }
          
          .content-section {
            padding: 16px !important;
            gap: 16px !important;
          }
          
          .section-block {
            padding: 16px !important;
          }
        }

        /* Support for PWA display modes */
        @media (display-mode: standalone) {
          .homepage-container {
            padding-top: calc(env(safe-area-inset-top, 20px) + 20px) !important;
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
          .content-wrapper {
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
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
      <div style={styles.container} className="homepage-container">
        {FloatingElements}

        <div style={styles.mainContainer}>
          <div style={styles.contentWrapper} className="content-wrapper">
            <div
              style={styles.networkIndicator}
              title={isOnline ? 'Online' : 'Offline'}
            />

            <div style={styles.headerSection}>
              <Header user={user} />
            </div>

            <div style={styles.contentSection} className="content-section">
              <div style={styles.sectionBlock} className="section-block">
                {/* Summary prop kaldırıldı - artık gerekmiyor */}
                <FinancialSummary
                  user={user}
                  events={events}
                  expenses={expenses}
                />
              </div>

              <div style={styles.sectionBlock} className="section-block">
                <PersonalStats
                  user={user}
                  events={events}
                  expenses={expenses}
                />
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </>
  );
};

export default HomePage;
