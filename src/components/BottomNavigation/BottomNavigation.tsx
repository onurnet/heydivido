// components/BottomNavigation/BottomNavigation.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '428px',
    background: 'white',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '12px 0',
    borderRadius: '20px 20px 0 0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
  };

  const navItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#7f8c8d',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s',
    textDecoration: 'none',
    padding: '8px'
  };

  const activeNavItemStyle: React.CSSProperties = {
    ...navItemStyle,
    color: '#4A90E2'
  };

  const addBtnStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(74,144,226,0.4)',
    transition: 'all 0.2s',
    animation: 'pulse 2s infinite'
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleAddClick = () => {
    // This would typically open a modal or navigate to an add page
    alert(
      `${t('add_menu_title')}\n\n${t('add_new_event')}\n${t(
        'add_new_expense'
      )}\n${t('add_friend')}`
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={navStyle}>
      <div
        style={isActive('/') ? activeNavItemStyle : navItemStyle}
        onClick={() => handleNavigation('/')}
      >
        <i className="fas fa-home" style={{ fontSize: '20px' }}></i>
        <span>{t('nav_home')}</span>
      </div>

      <div
        style={isActive('/events') ? activeNavItemStyle : navItemStyle}
        onClick={() => handleNavigation('/events')}
      >
        <i className="fas fa-calendar-alt" style={{ fontSize: '20px' }}></i>
        <span>{t('nav_events')}</span>
      </div>

      <button
        style={addBtnStyle}
        onClick={handleAddClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(74,144,226,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,226,0.4)';
        }}
      >
        <i className="fas fa-plus"></i>
      </button>

      <div
        style={isActive('/expenses') ? activeNavItemStyle : navItemStyle}
        onClick={() => handleNavigation('/expenses')}
      >
        <i className="fas fa-receipt" style={{ fontSize: '20px' }}></i>
        <span>{t('nav_expenses')}</span>
      </div>

      <div
        style={isActive('/account') ? activeNavItemStyle : navItemStyle}
        onClick={() => handleNavigation('/account')}
      >
        <i className="fas fa-user" style={{ fontSize: '20px' }}></i>
        <span>{t('nav_account')}</span>
      </div>
    </nav>
  );
};

export default BottomNavigation;
