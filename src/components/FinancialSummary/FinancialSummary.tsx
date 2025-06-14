// src/components/FinancialSummary/FinancialSummary.tsx
import React, { useMemo, useEffect } from 'react';
import type { User, Event, Expense, Summary } from '../../types/types';

interface FinancialSummaryProps {
  user: User;
  events: Event[];
  expenses: Expense[];
  summary: Summary;
}

interface CurrencyAmount {
  [currency: string]: number;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  user,
  events,
  expenses,
  summary
}) => {
  // Debug: FinancialSummary props'larını kontrol et
  useEffect(() => {
    console.log('🔍 FinancialSummary received props:', {
      user: user?.id,
      summary,
      eventsCount: events.length,
      expensesCount: expenses.length
    });
    console.log(
      '🔍 FinancialSummary summary.total_expenses:',
      summary.total_expenses,
      typeof summary.total_expenses
    );
  }, [user, summary, events, expenses]);

  const { myExpenses, expectedPayments } = useMemo(() => {
    // Filter active events
    const activeEvents = events.filter(
      (event) => event.status === 'active' || !event.hasOwnProperty('status')
    );
    const activeEventIds = new Set(activeEvents.map((event) => event.id));

    // Calculate my expenses in active events
    const myExpenses: CurrencyAmount = {};
    expenses
      .filter(
        (expense) =>
          activeEventIds.has(expense.event_id || expense.eventId) &&
          (expense.paid_by === user.id || expense.paid_by === user.real_id)
      )
      .forEach((expense) => {
        const amount =
          typeof expense.amount === 'string'
            ? parseFloat(expense.amount)
            : expense.amount || 0;

        myExpenses[expense.currency] =
          (myExpenses[expense.currency] || 0) + amount;
      });

    // Calculate expected payments (money others owe me)
    const expectedPayments: CurrencyAmount = {};
    expenses
      .filter(
        (expense) =>
          activeEventIds.has(expense.event_id || expense.eventId) &&
          (expense.paid_by === user.id || expense.paid_by === user.real_id) &&
          expense.splits &&
          expense.splits.length > 1
      )
      .forEach((expense) => {
        const myShare =
          expense.splits?.find((split) => split.userId === user.id)?.amount ||
          0;
        const amount =
          typeof expense.amount === 'string'
            ? parseFloat(expense.amount)
            : expense.amount || 0;
        const othersOweMeTotal = amount - myShare;

        if (othersOweMeTotal > 0) {
          expectedPayments[expense.currency] =
            (expectedPayments[expense.currency] || 0) + othersOweMeTotal;
        }
      });

    console.log('🔍 FinancialSummary calculated:', {
      myExpenses,
      expectedPayments
    });

    return { myExpenses, expectedPayments };
  }, [user.id, user.real_id, events, expenses]);

  // App.tsx'den gelen summary'yi kullan
  const totalExpensesFromSummary = summary.total_expenses || 0;

  const styles = {
    container: {
      width: '100%'
    },

    title: {
      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 'clamp(16px, 3vw, 20px)',
      textAlign: 'center' as const
    },

    // Summary kartı
    summaryCard: {
      background: 'rgba(0, 245, 255, 0.1)',
      borderRadius: '12px',
      padding: 'clamp(16px, 3vw, 20px)',
      border: '1px solid rgba(0, 245, 255, 0.2)',
      marginBottom: 'clamp(16px, 3vw, 20px)',
      textAlign: 'center' as const
    },

    summaryTitle: {
      fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
      fontWeight: '500',
      color: '#00f5ff',
      marginBottom: 'clamp(8px, 1.5vw, 12px)'
    },

    summaryAmount: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: '700',
      color: '#ffffff'
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(16px, 3vw, 24px)',
      '@media (max-width: 640px)': {
        gridTemplateColumns: '1fr',
        gap: 'clamp(12px, 2vw, 16px)'
      }
    },

    column: {
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      padding: 'clamp(16px, 3vw, 20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(5px)'
    },

    columnTitle: {
      fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
      fontWeight: '500',
      color: '#00f5ff',
      marginBottom: 'clamp(12px, 2vw, 16px)',
      textAlign: 'center' as const
    },

    currencyList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'clamp(8px, 1.5vw, 12px)'
    },

    currencyItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'clamp(8px, 1.5vw, 12px)',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },

    currency: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: '500',
      color: '#e2e8f0'
    },

    amount: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: '600',
      color: '#ffffff'
    },

    emptyState: {
      textAlign: 'center' as const,
      color: '#64748b',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontStyle: 'italic',
      padding: 'clamp(16px, 3vw, 20px)'
    },

    // Mobile-specific styles
    mobileGrid: {
      '@media (max-width: 640px)': {
        gridTemplateColumns: '1fr'
      }
    }
  };

  const formatAmount = (amount: number): string => {
    const validAmount =
      typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(validAmount);
  };

  const renderCurrencyList = (
    amounts: CurrencyAmount,
    type: 'expense' | 'payment'
  ) => {
    const entries = Object.entries(amounts);

    if (entries.length === 0) {
      return (
        <div style={styles.emptyState}>
          {type === 'expense'
            ? 'Henüz aktif bir harcama yok'
            : 'Beklenen ödeme yok'}
        </div>
      );
    }

    return (
      <div style={styles.currencyList}>
        {entries.map(([currency, amount]) => (
          <div key={currency} style={styles.currencyItem}>
            <span style={styles.currency}>{currency}</span>
            <span style={styles.amount}>{formatAmount(amount)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💰 Mali Durumum</h3>

      {/* App.tsx'den gelen toplam expense'i göster */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryTitle}>Toplam Harcamalarım</div>
        <div style={styles.summaryAmount}>
          {formatAmount(totalExpensesFromSummary)} TL
        </div>
      </div>

      <div
        style={{ ...styles.grid, ...styles.mobileGrid }}
        className="financial-grid"
      >
        {/* Left Column: My Expenses */}
        <div style={styles.column}>
          <h4 style={styles.columnTitle}>Toplam Aktif Harcamalarım</h4>
          {renderCurrencyList(myExpenses, 'expense')}
        </div>

        {/* Right Column: Expected Payments */}
        <div style={styles.column}>
          <h4 style={styles.columnTitle}>Beklediğim Ödemeler</h4>
          {renderCurrencyList(expectedPayments, 'payment')}
        </div>
      </div>

      <style>
        {`
          @media (max-width: 640px) {
            .financial-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FinancialSummary;
