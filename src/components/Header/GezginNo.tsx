// components/Header/GezginNo.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface GezginNoProps {
  gezginNo: string;
}

const GezginNo: React.FC<GezginNoProps> = ({ gezginNo }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const containerStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
    position: 'relative',
    zIndex: 2
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    opacity: 0.9
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginTop: '4px'
  };

  const copyBtnStyle: React.CSSProperties = {
    background: copied ? '#26a69a' : 'white',
    color: copied ? 'white' : '#4A90E2',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gezginNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={containerStyle}>
      <div>
        <div style={textStyle}>{t('gezgin_no_label')}</div>
        <div style={valueStyle}>{gezginNo}</div>
      </div>
      <button
        style={copyBtnStyle}
        onClick={handleCopy}
        onMouseEnter={(e) => {
          if (!copied) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!copied) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <i className={copied ? 'fas fa-check' : 'fas fa-copy'}></i>{' '}
        {copied ? t('copy_success') : t('copy_btn')}
      </button>
    </div>
  );
};

export default GezginNo;
