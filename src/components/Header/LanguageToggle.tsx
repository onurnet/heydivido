// components/Header/LanguageToggle.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '15px',
    fontSize: '11px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s',
    position: 'relative',
    zIndex: 2
  };

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      style={toggleStyle}
      onClick={handleLanguageToggle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
      }}
    >
      <i className="fas fa-globe"></i> {i18n.language.toUpperCase()}
    </button>
  );
};

export default LanguageToggle;
