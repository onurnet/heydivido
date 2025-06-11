// src/components/HomePage.tsx
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
  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '0 auto',
    background: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: '"Inter", system-ui, sans-serif'
  };

  const contentStyle: React.CSSProperties = {
    padding: '0 20px 20px'
  };

  return (
    <div style={containerStyle}>
      <Header user={user} />
      <div style={contentStyle}>
        <SummaryCards summary={summary} />
        <Tabs events={events} expenses={expenses} />
      </div>
    </div>
  );
};

export default HomePage;
