// src/components/SummaryCards/SummaryCards.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Summary } from '../../types/types';

interface SummaryCardsProps {
  summary: Summary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const { t } = useTranslation();

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '25px'
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '18px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid rgba(74,144,226,0.1)',
    transition: 'all 0.2s'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#4A90E2',
    marginBottom: '6px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#7f8c8d',
    fontWeight: 500
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={containerStyle}>
      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        }}
      >
        <div style={valueStyle}>{summary.totalEvents}</div>
        <div style={labelStyle}>{t('total_events')}</div>
      </div>
      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        }}
      >
        <div style={valueStyle}>{formatCurrency(summary.totalExpenses)}</div>
        <div style={labelStyle}>{t('total_expenses')}</div>
      </div>
    </div>
  );
};

export default SummaryCards;
