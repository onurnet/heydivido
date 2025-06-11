import React from 'react';
import Header from './Header/Header';
import SummaryCards from './SummaryCards/SummaryCards';
import Tabs from './Tabs/Tabs';
import BottomNavigation from './BottomNavigation/BottomNavigation';
import type { Event, Expense, UserSummary, User } from '../../types/types';

interface HomePageProps {
  user: User;
  events: Event[];
  expenses: Expense[];
  summary: UserSummary;
}

const HomePage: React.FC<HomePageProps> = ({
  user,
  events,
  expenses,
  summary
}) => {
  const containerStyle: React.CSSProperties = {
    maxWidth: '428px',
    margin: '0 auto',
    background: 'white',
    minHeight: '100vh',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    position: 'relative'
  };

  const mainContentStyle: React.CSSProperties = {
    padding: '20px',
    paddingBottom: '100px' // Space for bottom navigation
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh',
    color: '#2c3e50',
    margin: 0,
    padding: 0
  };

  // Apply body styles on mount
  React.useEffect(() => {
    Object.assign(document.body.style, bodyStyle);

    // Add global CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(74,144,226,0.4); }
        70% { box-shadow: 0 0 0 10px rgba(74,144,226,0); }
        100% { box-shadow: 0 0 0 0 rgba(74,144,226,0); }
      }
      
      @media (min-width: 429px) {
        .container {
          max-width: 800px !important;
          margin: 20px auto !important;
          border-radius: 20px !important;
          overflow: hidden !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={containerStyle} className="container">
      <Header user={user} />
      <main style={mainContentStyle}>
        <SummaryCards summary={summary} />
        <Tabs events={events} expenses={expenses} />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
