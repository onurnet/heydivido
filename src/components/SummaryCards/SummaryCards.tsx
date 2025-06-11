// components/SummaryCards/SummaryCards.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserSummary } from '../../types/types';

interface SummaryCardsProps {
  summary: UserSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const { t } = useTranslation();

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '30px'
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '1px solid rgba(74,144,226,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const iconStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    fontSize: '18px'
  };

  const expensesIconStyle: React.CSSProperties = {
    ...iconStyle,
    background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
    color: 'white'
  };

  const receivablesIconStyle: React.CSSProperties = {
    ...iconStyle,
    background: 'linear-gradient(135deg, #4ecdc4, #26a69a)',
    color: 'white'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px',
    fontWeight: 500
  };

  const amountStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#2c3e50'
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <section style={containerStyle}>
      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        }}
      >
        <div style={expensesIconStyle}>
          <i className="fas fa-credit-card"></i>
        </div>
        <div style={labelStyle}>{t('total_expenses')}</div>
        <div style={amountStyle}>
          {formatAmount(summary.totalExpenses, summary.currency)}
        </div>
      </div>

      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        }}
      >
        <div style={receivablesIconStyle}>
          <i className="fas fa-hand-holding-usd"></i>
        </div>
        <div style={labelStyle}>{t('pending_receivables')}</div>
        <div style={amountStyle}>
          {formatAmount(summary.pendingReceivables, summary.currency)}
        </div>
      </div>
    </section>
  );
};

export default SummaryCards;
