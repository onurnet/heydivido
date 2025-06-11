// components/Tabs/EventCard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Event } from '../../types/types';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useTranslation();

  const itemStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    border: '1px solid rgba(74,144,226,0.08)',
    transition: 'all 0.2s'
  };

  const eventItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  };

  const iconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px'
  };

  const infoStyle: React.CSSProperties = {
    flex: 1
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: '4px'
  };

  const detailsStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#7f8c8d',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const participantsStyle: React.CSSProperties = {
    background: '#e8f4f8',
    color: '#4A90E2',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600
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
      <div style={eventItemStyle}>
        <div style={iconStyle}>
          <i className={event.icon}></i>
        </div>
        <div style={infoStyle}>
          <div style={nameStyle}>{event.name}</div>
          <div style={detailsStyle}>
            <i className="fas fa-map-marker-alt"></i>
            <span>{event.location}</span>
            <span style={participantsStyle}>
              {event.participantCount} {t('people')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
