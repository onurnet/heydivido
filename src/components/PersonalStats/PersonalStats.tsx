// src/components/PersonalStats/PersonalStats.tsx
import React, { useMemo } from 'react';
import type { User, Event, Expense } from '../../types/types';

interface PersonalStatsProps {
  user: User;
  events: Event[];
  expenses: Expense[];
}

interface StatItem {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({
  user,
  events,
  expenses
}) => {
  const stats = useMemo<StatItem[]>(() => {
    if (!user || !events || !expenses) return [];

    const eventsOrganized = events.filter(
      (event) => event.created_by === user.auth_user_id
    ).length;

    const participantEventIds = new Set(
      expenses
        .filter((e) => e.splits?.some((s) => s.userId === user.id))
        .map((e) => e.event_id)
    );

    const eventsParticipated = events.filter((event) =>
      participantEventIds.has(event.id)
    ).length;

    const coTravelerCount: {
      [userId: string]: { count: number; name: string };
    } = {};
    expenses.forEach((expense) => {
      expense.splits?.forEach((split) => {
        if (split.userId !== user.id) {
          if (!coTravelerCount[split.userId]) {
            coTravelerCount[split.userId] = {
              count: 0,
              name: `User ${split.userId.slice(-4)}`
            };
          }
          coTravelerCount[split.userId].count++;
        }
      });
    });

    const mostFrequentCoTraveler = Object.values(coTravelerCount).sort(
      (a, b) => b.count - a.count
    )[0];

    const expensesByEvent: {
      [eventId: string]: { total: number; eventName: string; currency: string };
    } = {};
    expenses
      .filter((expense) => expense.paid_by === user.id)
      .forEach((expense) => {
        if (!expensesByEvent[expense.event_id]) {
          const event = events.find((e) => e.id === expense.event_id);
          expensesByEvent[expense.event_id] = {
            total: 0,
            eventName: event?.name || 'Bilinmeyen Etkinlik',
            currency: expense.currency
          };
        }
        expensesByEvent[expense.event_id].total += +expense.amount;
      });

    const biggestSpendingEvent = Object.values(expensesByEvent).sort(
      (a, b) => b.total - a.total
    )[0];

    const tripDurations: {
      [eventId: string]: { days: number; eventName: string };
    } = {};
    events.forEach((event) => {
      const eventExpenses = expenses.filter(
        (expense) => expense.event_id === event.id
      );
      if (eventExpenses.length > 1) {
        const dates = eventExpenses
          .map(
            (expense) => new Date(expense.expense_date || expense.created_at)
          )
          .sort((a, b) => a.getTime() - b.getTime());
        const diffDays = Math.ceil(
          (dates[dates.length - 1].getTime() - dates[0].getTime()) /
            (1000 * 60 * 60 * 24)
        );
        tripDurations[event.id] = {
          days: diffDays,
          eventName: event.name
        };
      }
    });

    const longestTrip = Object.values(tripDurations).sort(
      (a, b) => b.days - a.days
    )[0];

    const lastEventOrganized = events
      .filter((event) => event.created_by === user.auth_user_id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

    return [
      {
        icon: '👑',
        label: 'Düzenlediğim Etkinlikler',
        value: eventsOrganized,
        subtext: 'toplam organizasyon'
      },
      {
        icon: '🎒',
        label: 'Katıldığım Etkinlikler',
        value: eventsParticipated,
        subtext: 'toplam katılım'
      },
      {
        icon: '🤝',
        label: 'En Sık Beraber Gittiğim',
        value: mostFrequentCoTraveler?.name || 'Henüz yok',
        subtext: mostFrequentCoTraveler
          ? `${mostFrequentCoTraveler.count} kez beraber`
          : ''
      },
      {
        icon: '💸',
        label: 'En Çok Harcadığım Etkinlik',
        value: biggestSpendingEvent
          ? `${biggestSpendingEvent.total.toFixed(2)} ${
              biggestSpendingEvent.currency
            }`
          : 'Henüz yok',
        subtext: biggestSpendingEvent?.eventName || ''
      },
      {
        icon: '📅',
        label: 'En Uzun Seyahatim',
        value: longestTrip ? `${longestTrip.days} gün` : 'Henüz yok',
        subtext: longestTrip?.eventName || ''
      },
      {
        icon: '🆕',
        label: 'Son Düzenlediğim',
        value: lastEventOrganized?.name || 'Henüz yok',
        subtext: lastEventOrganized
          ? new Date(lastEventOrganized.created_at).toLocaleDateString('tr-TR')
          : ''
      }
    ];
  }, [user, events, expenses]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Kişisel İstatistiklerim</h3>
      <div style={styles.grid} className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.statHeader}>
              <span style={styles.statIcon}>{stat.icon}</span>
              <span style={styles.statLabel}>{stat.label}</span>
            </div>
            <div style={styles.statValue}>{stat.value}</div>
            {stat.subtext && (
              <div style={styles.statSubtext}>{stat.subtext}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { width: '100%' },
  title: {
    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
    fontWeight: 600,
    color: '#fff',
    marginBottom: 'clamp(16px, 3vw, 20px)',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'clamp(12px, 2vw, 16px)'
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: 'clamp(16px, 3vw, 20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s ease',
    cursor: 'default'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 1.5vw, 12px)',
    marginBottom: 'clamp(8px, 1.5vw, 12px)'
  },
  statIcon: {
    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
  },
  statLabel: {
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: 500,
    color: '#00f5ff',
    flex: 1
  },
  statValue: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: 'clamp(4px, 1vw, 6px)',
    wordBreak: 'break-word'
  },
  statSubtext: {
    fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
    color: '#94a3b8',
    fontStyle: 'italic'
  }
};

export default PersonalStats;
