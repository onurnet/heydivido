// components/Tabs/Tabs.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import EventsList from './EventsList';
import ExpensesList from './ExpensesList';
import type { Event, Expense } from '../../types/types';

interface TabsProps {
  events: Event[];
  expenses: Expense[];
}

const Tabs: React.FC<TabsProps> = ({ events, expenses }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'events' | 'expenses'>(
    'events'
  );

  const containerStyle: React.CSSProperties = {
    marginBottom: '20px'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '20px'
  };

  const tabBtnStyle: React.CSSProperties = {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#7f8c8d',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const activeTabBtnStyle: React.CSSProperties = {
    ...tabBtnStyle,
    background: '#4A90E2',
    color: 'white',
    boxShadow: '0 2px 8px rgba(74,144,226,0.3)'
  };

  const contentStyle: React.CSSProperties = {
    animation: 'fadeIn 0.3s ease-in'
  };

  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <button
          style={activeTab === 'events' ? activeTabBtnStyle : tabBtnStyle}
          onClick={() => setActiveTab('events')}
        >
          {t('recent_events')}
        </button>
        <button
          style={activeTab === 'expenses' ? activeTabBtnStyle : tabBtnStyle}
          onClick={() => setActiveTab('expenses')}
        >
          {t('recent_expenses')}
        </button>
      </div>

      <div style={contentStyle}>
        {activeTab === 'events' ? (
          <EventsList events={events} />
        ) : (
          <ExpensesList expenses={expenses} />
        )}
      </div>
    </section>
  );
};

export default Tabs;
