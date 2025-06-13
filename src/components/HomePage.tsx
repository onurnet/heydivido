// src/components/HomePage.tsx
import BottomNavigation from './BottomNavigation/BottomNavigation';
import React from 'react';
import Header from './Header/Header';
import SummaryCards from './SummaryCards/SummaryCards';
import Tabs from './Tabs/Tabs';
import type { User, Summary, Event, Expense } from '../types/types';

interface HomePageProps {
  user: User;
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
  const styles = {
    container: {
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100%',
      background:
        'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      padding:
        'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
      position: 'relative' as const,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 'clamp(20px, 5vh, 40px)',
      paddingBottom: 'clamp(20px, 5vh, 40px)',
      paddingLeft: 'clamp(16px, 4vw, 32px)',
      paddingRight: 'clamp(16px, 4vw, 32px)'
    },

    floatingElement: {
      position: 'absolute' as const,
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'float 8s ease-in-out infinite'
    },

    contentWrapper: {
      background: 'rgba(26, 26, 46, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '1000px',
      position: 'relative' as const,
      zIndex: 2,
      overflowY: 'auto', // <== scrollable yapıyoruz
      minHeight: '600px',
      maxHeight: 'calc(100vh - 100px)', // <== fixed bottom nav yüksekliği kadar boşluk bırakıyoruz
      paddingBottom: '100px' // <== içerik altına padding bırakıyoruz ki nav çakışmasın
    },

    headerSection: {
      background: 'rgba(255, 255, 255, 0.02)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    },

    contentSection: {
      padding: 'clamp(20px, 4vw, 32px)',
      background: 'transparent'
    },

    networkIndicator: {
      position: 'absolute' as const,
      top: '15px',
      left: '15px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#4CAF50',
      boxShadow: '0 0 10px #4CAF50',
      zIndex: 3
    }
  };

  return (
    <div style={styles.container} className="homepage-container">
      {/* Background floating elements */}
      <div
        style={{
          ...styles.floatingElement,
          top: '10%',
          left: '15%',
          width: '200px',
          height: '200px',
          background: 'rgba(0, 245, 255, 0.1)',
          animationDelay: '0s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 0, 110, 0.1)',
          animationDelay: '4s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          top: '60%',
          left: '10%',
          width: '120px',
          height: '120px',
          background: 'rgba(131, 56, 236, 0.1)',
          animationDelay: '7s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          top: '30%',
          right: '25%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 193, 7, 0.1)',
          animationDelay: '2s'
        }}
      />
      <div
        style={{
          ...styles.floatingElement,
          bottom: '40%',
          left: '25%',
          width: '80px',
          height: '80px',
          background: 'rgba(76, 175, 80, 0.1)',
          animationDelay: '5s'
        }}
      />

      {/* CSS Animations */}
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
            33% { transform: translateY(-25px) rotate(3deg); }
            66% { transform: translateY(15px) rotate(-3deg); }
          }

          /* PWA-specific styles */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* PWA-style scrolling */
          * {
            -webkit-overflow-scrolling: touch;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .homepage-container {
              padding: 0 1rem !important;
              padding-top: env(safe-area-inset-top, 20px) !important;
              padding-bottom: env(safe-area-inset-bottom, 20px) !important;
            }
            
            .content-wrapper {
              border-radius: 20px !important;
              margin: 0.5rem !important;
            }
          }

          @media (max-width: 480px) {
            .content-section {
              padding: 1rem !important;
            }
          }

          /* PWA display modes */
          @media (display-mode: standalone) {
            .homepage-container {
              padding-top: calc(env(safe-area-inset-top, 20px) + 20px);
            }
          }

          /* Accessibility */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          @media (prefers-contrast: high) {
            .content-wrapper {
              border: 2px solid rgba(255, 255, 255, 0.3) !important;
            }
          }

          /* Smooth transitions for components */
          .header-section,
          .content-section {
            transition: all 0.3s ease;
          }

          /* Custom scrollbar for dark theme */
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
        `}
      </style>

      {/* Main Content Wrapper */}
      <div style={styles.contentWrapper} className="content-wrapper">
        {/* Network Status Indicator */}
        <div style={styles.networkIndicator} title="Online"></div>

        {/* Header Section */}
        <div style={styles.headerSection} className="header-section">
          <Header user={user} />
        </div>

        {/* Content Section */}
        <div style={styles.contentSection} className="content-section">
          <SummaryCards summary={summary} />
          <Tabs events={events} expenses={expenses} />
        </div>
      </div>
      {/* Bottom Navigation (fixed) */}
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
