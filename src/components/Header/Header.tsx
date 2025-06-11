import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import GezginNo from './GezginNo';
import type { User } from '../../types/types';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
    color: 'white',
    padding: '20px 20px 30px',
    borderRadius: '0 0 25px 25px',
    position: 'relative',
    overflow: 'hidden'
  };

  const headerTopStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 2
  };

  const greetingSectionStyle: React.CSSProperties = {
    flex: 1
  };

  const greetingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600
  };

  const locationTimeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    opacity: 0.9,
    marginTop: '4px'
  };

  const headerActionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'flex-end'
  };

  const walletBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    backdropFilter: 'blur(10px)',
    cursor: 'not-allowed',
    opacity: 0.7,
    position: 'relative',
    zIndex: 2
  };

  return (
    <header style={headerStyle}>
      <div style={headerTopStyle}>
        <div style={greetingSectionStyle}>
          <div style={greetingStyle}>{t('greeting', { name: user.name })}</div>
          <div style={locationTimeStyle}>
            <i className="fas fa-map-marker-alt"></i>
            <span>{user.location}</span>
            <span>•</span>
            <span>{timeString}</span>
          </div>
        </div>
        <div style={headerActionsStyle}>
          <LanguageToggle />
          <button style={walletBtnStyle}>
            <i className="fas fa-wallet"></i> {t('wallet_soon')}
          </button>
        </div>
      </div>
      <GezginNo gezginNo={user.gezginNo} />
    </header>
  );
};

export default Header;
