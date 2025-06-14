import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const isInEventDetailPage =
    location.pathname.startsWith('/events/') &&
    (location.pathname.match(/^\/events\/[^/]+$/) ||
      location.pathname.match(/^\/events\/[^/]+\/edit$/));

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
    padding: '16px 0 20px 0',
    borderRadius: '20px 20px 0 0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
    zIndex: 9999
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
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    padding: '6px 8px',
    lineHeight: '1.1',
    textAlign: 'center' as const,
    minWidth: '50px'
  };

  const activeNavItemStyle: React.CSSProperties = {
    ...navItemStyle,
    color: '#4A90E2',
    fontWeight: 600,
    transform: 'scale(1.05)'
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '20px',
    marginBottom: '1px'
  };

  const activeIconStyle: React.CSSProperties = {
    ...iconStyle,
    fontSize: '22px'
  };

  const addBtnStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    background:
      'linear-gradient(135deg, #00f5ff 0%, #4A90E2 50%, #ff006e 100%)',
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(74, 144, 226, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    transform: showAddMenu
      ? 'rotate(45deg) scale(1.1)'
      : 'rotate(0deg) scale(1)',
    zIndex: 10
  };

  const addMenuStyle: React.CSSProperties = {
    position: 'absolute' as const,
    bottom: '85px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(26, 26, 46, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '280px',
    opacity: showAddMenu ? 1 : 0,
    visibility: showAddMenu ? 'visible' : 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 9998
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '10px',
    textDecoration: 'none'
  };

  const menuItemHoverStyle: React.CSSProperties = {
    background: 'rgba(0, 245, 255, 0.1)',
    borderColor: 'rgba(0, 245, 255, 0.3)',
    transform: 'translateY(-2px)'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    opacity: showAddMenu ? 1 : 0,
    visibility: showAddMenu ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
    zIndex: 9997
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleAddClick = () => {
    if (
      location.pathname.startsWith('/events/') &&
      location.pathname !== '/events'
    ) {
      const eventId = location.pathname.split('/')[2];
      navigate(`/events/${eventId}/add-expense`);
    } else {
      setShowAddMenu(!showAddMenu);
    }
  };

  const handleMenuItemClick = (action: string) => {
    setShowAddMenu(false);

    if (action === 'add-event') {
      navigate('/add-event');
    } else if (action === 'add-expense') {
      navigate('/add-expense');
    }
  };

  const closeMenu = () => {
    setShowAddMenu(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={closeMenu} />

      {/* Add Menu */}
      <div style={addMenuStyle}>
        <div
          style={menuItemStyle}
          onClick={() => handleMenuItemClick('add-event')}
          onMouseEnter={(e) =>
            Object.assign(e.currentTarget.style, menuItemHoverStyle)
          }
          onMouseLeave={(e) =>
            Object.assign(e.currentTarget.style, menuItemStyle)
          }
        >
          <span style={{ fontSize: '20px' }}>📅</span>
          <span>{t('add_new_event')}</span>
        </div>

        {isInEventDetailPage && (
          <div
            style={menuItemStyle}
            onClick={() => handleMenuItemClick('add-expense')}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, menuItemHoverStyle)
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, menuItemStyle)
            }
          >
            <span style={{ fontSize: '20px' }}>💰</span>
            <span>{t('add_new_expense')}</span>
          </div>
        )}
      </div>

      <nav style={navStyle}>
        <div
          style={isActive('/home') ? activeNavItemStyle : navItemStyle}
          onClick={() => handleNavigation('/home')}
        >
          <span style={isActive('/home') ? activeIconStyle : iconStyle}>
            🏠
          </span>
          <span>{t('nav_home')}</span>
        </div>

        <div
          style={isActive('/events') ? activeNavItemStyle : navItemStyle}
          onClick={() => handleNavigation('/events')}
        >
          <span style={isActive('/events') ? activeIconStyle : iconStyle}>
            📅
          </span>
          <span>{t('nav_events')}</span>
        </div>

        <button
          style={addBtnStyle}
          onClick={handleAddClick}
          onMouseEnter={(e) => {
            if (!showAddMenu) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow =
                '0 12px 35px rgba(74, 144, 226, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showAddMenu) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow =
                '0 8px 25px rgba(74, 144, 226, 0.4)';
            }
          }}
        >
          <i className="fas fa-plus"></i>
        </button>

        <div
          style={isActive('/all-expenses') ? activeNavItemStyle : navItemStyle}
          onClick={() => handleNavigation('/all-expenses')}
        >
          <span style={isActive('/all-expenses') ? activeIconStyle : iconStyle}>
            💰
          </span>
          <span>{t('nav_expenses')}</span>
        </div>

        <div
          style={isActive('/profile') ? activeNavItemStyle : navItemStyle}
          onClick={() => handleNavigation('/profile')}
        >
          <span style={isActive('/profile') ? activeIconStyle : iconStyle}>
            👤
          </span>
          <span>{t('nav_account')}</span>
        </div>
      </nav>

      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
            }
            50% {
              box-shadow: 0 8px 25px rgba(74, 144, 226, 0.6), 0 0 0 10px rgba(74, 144, 226, 0.1);
            }
            100% {
              box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
            }
          }

          * {
            -webkit-tap-highlight-color: transparent;
          }

          nav span {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }

          @media (max-width: 350px) {
            nav div {
              padding: 4px 6px !important;
            }
            nav span {
              font-size: 10px !important;
            }
            nav > div > span:first-child {
              font-size: 18px !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default BottomNavigation;
