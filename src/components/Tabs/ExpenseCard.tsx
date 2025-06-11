// src/components/Tabs/ExpenseCard.tsx
import React from 'react';
import type { Expense } from '../../types/types';

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const itemStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    border: '1px solid rgba(74,144,226,0.08)',
    transition: 'all 0.2s'
  };

  const expenseItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const leftStyle: React.CSSProperties = {
    flex: 1
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: '4px'
  };

  const metaStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#7f8c8d',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const dateStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#95a5a6',
    marginTop: '4px'
  };

  const amountStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    color: '#4A90E2'
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      food: 'fas fa-utensils',
      accommodation: 'fas fa-bed',
      transport: 'fas fa-taxi',
      entertainment: 'fas fa-ticket-alt',
      other: 'fas fa-receipt'
    };
    return icons[category] || 'fas fa-receipt';
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
      }}
    >
      <div style={expenseItemStyle}>
        <div style={leftStyle}>
          <div style={descriptionStyle}>{expense.description}</div>
          <div style={metaStyle}>
            <span>{expense.eventName}</span>
            <span>•</span>
            <span>
              <i className={getCategoryIcon(expense.category)}></i>{' '}
              {expense.place}
            </span>
          </div>
          <div style={dateStyle}>{expense.date}</div>
        </div>
        <div style={amountStyle}>
          {formatAmount(expense.amount, expense.currency)}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
