// src/components/FinancialSummary/FinancialSummary.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import type { User, Event, Expense } from '../../types/types';

interface FinancialSummaryProps {
  user: User;
  events: Event[];
  expenses: Expense[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  user,
  events,
  expenses
}) => {
  const [eventParticipants, setEventParticipants] = useState<
    { event_id: string; user_id: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch event_participants data
  useEffect(() => {
    const fetchEventParticipants = async () => {
      if (!user?.id && !user?.real_id) return;

      try {
        console.log(
          '🔍 Fetching event_participants for user:',
          user.id,
          user.real_id
        );

        const { data, error } = await supabase
          .from('event_participants')
          .select('event_id, user_id')
          .or(`user_id.eq.${user.id},user_id.eq.${user.real_id || user.id}`);

        if (error) {
          console.error('❌ Error fetching event_participants:', error);
          setEventParticipants([]);
        } else {
          console.log('✅ Event participants loaded:', data);
          setEventParticipants(data || []);
        }
      } catch (err) {
        console.error('❌ Unexpected error in fetchEventParticipants:', err);
        setEventParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventParticipants();
  }, [user?.id, user?.real_id]);

  useEffect(() => {
    console.log('🔍 FinancialSummary props:', {
      userId: user?.id,
      eventsCount: events?.length,
      expensesCount: expenses?.length,
      eventParticipantsCount: eventParticipants?.length
    });
  }, [user, events, expenses, eventParticipants]);

  const { activeEventsCount, expectedPayments } = useMemo(() => {
    if (!user || !events || !expenses || loading) {
      return {
        activeEventsCount: 0,
        expectedPayments: 0
      };
    }

    // 1. Açık Etkinliklerim: event_participants tablosundan user'ın katıldığı active events
    const myEventIds = new Set(
      eventParticipants
        .filter((ep) => ep.user_id === user.id || ep.user_id === user.real_id)
        .map((ep) => ep.event_id)
    );

    console.log(
      '🔍 My event IDs from event_participants:',
      Array.from(myEventIds)
    );

    const myActiveEvents = events.filter((event) => {
      const isActive = event.status === 'active';
      const isParticipant = myEventIds.has(event.id);

      console.log(
        `🔍 Event ${event.id} (${event.name}): active=${isActive}, participant=${isParticipant}`
      );

      return isActive && isParticipant;
    });

    const activeEventsCount = myActiveEvents.length;
    const activeEventIds = new Set(myActiveEvents.map((e) => e.id));

    // 2. Beklediğim Ödemeler: active etkinliklerde benim ödediğim harcamalarda,
    //    diğerlerinin bana olan borçları
    let expectedPayments = 0;

    for (const expense of expenses) {
      // Sadece active etkinliklerdeki harcamalar
      if (!activeEventIds.has(expense.event_id)) continue;

      // Sadece benim ödediğim harcamalar
      const isPaidByMe =
        expense.paid_by === user.id || expense.paid_by === user.real_id;
      if (!isPaidByMe) continue;

      // Splits varsa, diğerlerinin paylarını topla
      if (expense.splits && expense.splits.length > 0) {
        const othersShare = expense.splits
          .filter(
            (split) => split.userId !== user.id && split.userId !== user.real_id
          )
          .reduce((sum, split) => sum + (split.amount || 0), 0);

        expectedPayments += othersShare;
      }
    }

    console.log('🔍 Calculated:', {
      activeEventsCount,
      expectedPayments,
      myActiveEvents: myActiveEvents.map((e) => ({ id: e.id, name: e.name })),
      myEventIds: Array.from(myEventIds)
    });

    return {
      activeEventsCount,
      expectedPayments
    };
  }, [user, events, expenses, eventParticipants, loading]);

  const formatAmount = (amount: number): string => {
    const validAmount =
      typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(validAmount);
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      width: '100%'
    },

    title: {
      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
      fontWeight: 600,
      color: '#ffffff',
      marginBottom: 'clamp(20px, 4vw, 32px)',
      textAlign: 'center',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(16px, 3vw, 24px)'
    },

    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: 'clamp(20px, 4vw, 32px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },

    cardIcon: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      marginBottom: 'clamp(12px, 2vw, 16px)',
      display: 'block'
    },

    cardTitle: {
      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
      fontWeight: 600,
      color: '#00f5ff',
      marginBottom: 'clamp(8px, 1.5vw, 12px)'
    },

    cardValue: {
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: 700,
      color: '#ffffff',
      marginBottom: 'clamp(4px, 1vw, 8px)'
    },

    cardSubtext: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: 400
    },

    // Hover efektleri için
    cardHover: {
      background: 'rgba(255, 255, 255, 0.08)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },

    // Gradient overlay for cards
    cardOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(255, 0, 110, 0.1) 100%)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none'
    },

    // Loading state
    loadingCard: {
      opacity: 0.6,
      pointerEvents: 'none'
    }
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;

    const card = e.currentTarget;
    const overlay = card.querySelector('.card-overlay') as HTMLElement;

    Object.assign(card.style, styles.cardHover);
    if (overlay) {
      overlay.style.opacity = '1';
    }
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;

    const card = e.currentTarget;
    const overlay = card.querySelector('.card-overlay') as HTMLElement;

    card.style.background = 'rgba(255, 255, 255, 0.05)';
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
    if (overlay) {
      overlay.style.opacity = '0';
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💰 Mali Durumum</h3>

      <div style={styles.grid} className="financial-grid">
        {/* Açık Etkinliklerim Kartı */}
        <div
          style={{
            ...styles.card,
            ...(loading ? styles.loadingCard : {})
          }}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <div className="card-overlay" style={styles.cardOverlay}></div>
          <span style={styles.cardIcon}>🎒</span>
          <h4 style={styles.cardTitle}>Açık Etkinliklerim</h4>
          <div style={styles.cardValue}>
            {loading ? '...' : activeEventsCount}
          </div>
          <div style={styles.cardSubtext}>
            {loading
              ? 'Yükleniyor...'
              : activeEventsCount === 0
              ? 'Henüz aktif etkinlik yok'
              : activeEventsCount === 1
              ? 'aktif etkinlik'
              : 'aktif etkinlik'}
          </div>
        </div>

        {/* Beklediğim Ödemeler Kartı */}
        <div
          style={{
            ...styles.card,
            ...(loading ? styles.loadingCard : {})
          }}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <div className="card-overlay" style={styles.cardOverlay}></div>
          <span style={styles.cardIcon}>💸</span>
          <h4 style={styles.cardTitle}>Beklediğim Ödemeler</h4>
          <div style={styles.cardValue}>
            {loading ? '...' : formatAmount(expectedPayments)}
          </div>
          <div style={styles.cardSubtext}>
            {loading
              ? 'Hesaplanıyor...'
              : expectedPayments === 0
              ? 'Bekleyen ödeme yok'
              : 'TL alacağım'}
          </div>
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

          @media (max-width: 480px) {
            .financial-grid {
              gap: 0.75rem !important;
            }
          }

          /* Accessibility improvements */
          @media (prefers-reduced-motion: reduce) {
            .financial-grid > div {
              transition: none !important;
            }
          }

          /* High contrast support */
          @media (prefers-contrast: high) {
            .financial-grid > div {
              border: 2px solid rgba(255, 255, 255, 0.3) !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FinancialSummary;
