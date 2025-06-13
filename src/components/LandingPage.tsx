import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogin = () => {
    // Replace with your router navigation
    window.location.href = '/login';
  };

  const handleSignup = () => {
    // Replace with your router navigation
    window.location.href = '/register';
  };

  const styles = {
    container: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: '1.6',
      color: '#ffffff',
      width: '100%',
      margin: '0',
      padding: '0',
      overflowX: 'hidden',
      background: '#0a0a0a'
    },

    // Hero Section - Full width background with centered content
    hero: {
      width: '100%',
      minHeight: '100vh',
      background:
        'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      position: 'relative' as const,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    },

    heroContent: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      position: 'relative' as const,
      zIndex: 3,
      margin: '0',
      padding: '0'
    },

    heroLeft: {
      transform: isVisible ? 'translateX(0)' : 'translateX(-100px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 1s ease-out',
      margin: '0',
      padding: '0'
    },

    heroRight: {
      transform: isVisible ? 'translateX(0)' : 'translateX(100px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 1s ease-out 0.3s',
      position: 'relative' as const,
      margin: '0',
      padding: '0'
    },

    heroTitle: {
      fontSize: 'clamp(3rem, 8vw, 8rem)',
      fontWeight: '900',
      marginBottom: '2rem',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e, #8338ec)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.1'
    },

    heroSubtitle: {
      fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
      marginBottom: '1.5rem',
      color: '#e0e0e0',
      fontWeight: '300'
    },

    heroDescription: {
      fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
      marginBottom: '3rem',
      color: '#b0b0b0',
      lineHeight: '1.6'
    },

    // Diagonal background elements
    diagonalShape: {
      position: 'absolute' as const,
      top: 0,
      right: '-20%',
      width: '60%',
      height: '100%',
      background:
        'linear-gradient(45deg, rgba(0, 245, 255, 0.1), rgba(255, 0, 110, 0.1))',
      transform: 'rotate(15deg)',
      borderRadius: '50px'
    },

    // Floating elements
    floatingElement: {
      position: 'absolute' as const,
      width: '200px',
      height: '200px',
      background:
        'linear-gradient(45deg, rgba(131, 56, 236, 0.3), rgba(255, 0, 110, 0.3))',
      borderRadius: '50%',
      filter: 'blur(50px)',
      animation: 'float 6s ease-in-out infinite'
    },

    // Buttons - Asymmetric design
    heroButtons: {
      display: 'flex',
      gap: '1.5rem',
      marginTop: '2rem'
    },

    primaryButton: {
      padding: '1rem 2.5rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '50px',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.4s ease',
      boxShadow: '0 10px 30px rgba(0, 245, 255, 0.3)',
      transform: 'translateY(0)',
      position: 'relative' as const,
      overflow: 'hidden'
    },

    secondaryButton: {
      padding: '1rem 2.5rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: '2px solid #00f5ff',
      borderRadius: '50px',
      background: 'transparent',
      color: '#00f5ff',
      cursor: 'pointer',
      transition: 'all 0.4s ease',
      backdropFilter: 'blur(20px)'
    },

    // Features - Full width black background, centered content
    featuresSection: {
      width: '100%',
      padding: '8rem 0',
      background: '#0a0a0a',
      position: 'relative' as const
    },

    featuresContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 4rem'
    },

    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
      marginTop: '4rem'
    },

    featureCard: {
      background:
        'linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(15, 15, 35, 0.8))',
      padding: '3rem',
      borderRadius: '30px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.4s ease',
      backdropFilter: 'blur(20px)',
      position: 'relative' as const,
      overflow: 'hidden'
    },

    // How It Works - Full width gradient background, centered content
    howItWorksSection: {
      width: '100%',
      padding: '8rem 0',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      position: 'relative' as const
    },

    stepsContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 4rem'
    },

    stepsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '6rem',
      marginTop: '4rem'
    },

    stepRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4rem',
      alignItems: 'center'
    },

    stepCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '3rem',
      borderRadius: '30px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      position: 'relative' as const
    },

    // Testimonials - Full width black background, centered content
    testimonialsSection: {
      width: '100%',
      padding: '8rem 0',
      background: '#0a0a0a',
      position: 'relative' as const
    },

    testimonialsContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 4rem',
      position: 'relative' as const
    },

    testimonialsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '3rem',
      marginTop: '4rem'
    },

    testimonialCard: {
      background:
        'linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(15, 15, 35, 0.8))',
      padding: '3rem',
      borderRadius: '30px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      position: 'relative' as const,
      transition: 'all 0.4s ease'
    },

    // CTA - Full width colorful gradient, centered content
    ctaSection: {
      width: '100%',
      padding: '10rem 0',
      background:
        'linear-gradient(135deg, #8338ec 0%, #ff006e 50%, #00f5ff 100%)',
      position: 'relative' as const,
      overflow: 'hidden'
    },

    ctaContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 4rem',
      textAlign: 'center' as const,
      position: 'relative' as const,
      zIndex: 2
    },

    // Footer - Full width pure black, centered content
    footer: {
      width: '100%',
      background: '#000000',
      padding: '6rem 0 3rem 0',
      position: 'relative' as const
    },

    footerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 4rem'
    },

    // Typography
    sectionTitle: {
      fontSize: 'clamp(2.5rem, 6vw, 5rem)',
      fontWeight: '800',
      marginBottom: '2rem',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },

    sectionSubtitle: {
      fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
      color: '#b0b0b0',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },

    featureIcon: {
      fontSize: '4rem',
      marginBottom: '2rem',
      display: 'block'
    },

    featureTitle: {
      fontSize: '1.8rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#ffffff'
    },

    featureDescription: {
      fontSize: '1.1rem',
      color: '#b0b0b0',
      lineHeight: '1.7'
    },

    stepIcon: {
      fontSize: '3rem',
      marginBottom: '1.5rem'
    },

    stepTitle: {
      fontSize: '1.8rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#ffffff'
    },

    stepDescription: {
      fontSize: '1.1rem',
      color: '#b0b0b0',
      lineHeight: '1.7'
    },

    testimonialText: {
      fontSize: '1.3rem',
      fontStyle: 'italic',
      color: '#e0e0e0',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },

    testimonialAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },

    testimonialAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: '700',
      color: 'white'
    },

    testimonialName: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '0.2rem'
    },

    testimonialTitle: {
      fontSize: '1rem',
      color: '#b0b0b0'
    },

    ctaTitle: {
      fontSize: 'clamp(3rem, 8vw, 6rem)',
      fontWeight: '900',
      marginBottom: '2rem',
      color: 'white'
    },

    ctaSubtitle: {
      fontSize: 'clamp(1.2rem, 3vw, 2rem)',
      marginBottom: '3rem',
      color: 'rgba(255, 255, 255, 0.9)'
    },

    ctaButtons: {
      display: 'flex',
      gap: '2rem',
      justifyContent: 'center',
      flexWrap: 'wrap' as const
    },

    footerLogo: {
      fontSize: '3rem',
      fontWeight: '900',
      marginBottom: '2rem',
      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textAlign: 'center' as const
    },

    footerLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '3rem',
      marginBottom: '3rem',
      flexWrap: 'wrap' as const
    },

    footerLink: {
      color: '#b0b0b0',
      textDecoration: 'none',
      fontSize: '1.1rem',
      transition: 'color 0.3s ease'
    },

    footerCopyright: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '2rem',
      textAlign: 'center' as const,
      color: '#707070'
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        width: '100%',
        margin: '0',
        padding: '0',
        position: 'relative',
        left: '0',
        right: '0'
      }}
    >
      {/* Language Selector */}
      <div
        className="language-selector"
        style={{
          position: 'fixed' as const,
          top: '30px',
          right: '30px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '10px 15px',
          display: 'flex',
          gap: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <button
          style={{
            background:
              i18n.language === 'en'
                ? 'linear-gradient(45deg, #00f5ff, #ff006e)'
                : 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            padding: '8px 15px',
            borderRadius: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
        <button
          style={{
            background:
              i18n.language === 'tr'
                ? 'linear-gradient(45deg, #00f5ff, #ff006e)'
                : 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            padding: '8px 15px',
            borderRadius: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => changeLanguage('tr')}
        >
          TR
        </button>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }
          
          #root {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(2deg); }
            66% { transform: translateY(10px) rotate(-2deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
          
          .hero-content-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            min-height: 100vh !important;
            padding: 0 2rem !important;
          }
          
          .hero-inner {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 4rem !important;
            align-items: center !important;
            max-width: 1400px !important;
            width: 100% !important;
          }
          
          @media (max-width: 1200px) {
            .hero-inner { 
              grid-template-columns: 1fr !important; 
              text-align: center !important; 
              gap: 2rem !important;
            }
            .step-row { 
              grid-template-columns: 1fr !important; 
              text-align: center !important; 
            }
            .hero-content-container {
              padding: 0 1.5rem !important;
            }
            .features-container, 
            .steps-container, 
            .testimonials-container, 
            .cta-container, 
            .footer-container { 
              padding: 0 2rem !important; 
            }
          }
          
          @media (max-width: 768px) {
            .features-grid { grid-template-columns: 1fr !important; }
            .testimonials-grid { grid-template-columns: 1fr !important; }
            .cta-buttons { 
              flex-direction: column !important; 
              align-items: center !important; 
            }
            .footer-links { 
              flex-direction: column !important; 
              gap: 1rem !important; 
              text-align: center !important; 
            }
            .features-container, 
            .steps-container, 
            .testimonials-container, 
            .cta-container, 
            .footer-container { 
              padding: 0 1.5rem !important; 
            }
            .hero-content-container { 
              padding: 0 1rem !important; 
            }
            .hero-inner {
              gap: 1.5rem !important;
            }
          }
        `}
      </style>

      {/* Hero Section */}
      <section
        style={{
          ...styles.hero,
          width: '100%',
          margin: '0',
          padding: '0',
          position: 'relative',
          left: '0',
          right: '0'
        }}
      >
        <div
          style={{
            ...styles.floatingElement,
            top: '10%',
            right: '20%',
            animationDelay: '0s'
          }}
        />
        <div
          style={{
            ...styles.floatingElement,
            top: '60%',
            left: '10%',
            animationDelay: '2s',
            width: '150px',
            height: '150px'
          }}
        />
        <div style={styles.diagonalShape} />

        <div style={styles.heroContent}>
          <div className="hero-content-container">
            <div className="hero-inner">
              <div style={styles.heroLeft}>
                <h1 style={styles.heroTitle}>{t('hero.title')}</h1>
                <p style={styles.heroSubtitle}>{t('hero.subtitle')}</p>
                <p style={styles.heroDescription}>{t('hero.description')}</p>

                <div style={styles.heroButtons}>
                  <button
                    style={styles.primaryButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(-5px) scale(1.05)';
                      e.currentTarget.style.boxShadow =
                        '0 20px 50px rgba(0, 245, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow =
                        '0 10px 30px rgba(0, 245, 255, 0.3)';
                    }}
                    onClick={handleSignup}
                  >
                    {t('hero.cta.primary')}
                  </button>
                  <button
                    style={styles.secondaryButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#00f5ff';
                      e.currentTarget.style.color = 'black';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#00f5ff';
                    }}
                    onClick={handleLogin}
                  >
                    {t('hero.cta.secondary')}
                  </button>
                </div>
              </div>

              <div style={styles.heroRight}>
                {/* Abstract visual element */}
                <div
                  style={{
                    width: '100%',
                    height: '400px',
                    background:
                      'linear-gradient(45deg, rgba(0, 245, 255, 0.2), rgba(255, 0, 110, 0.2))',
                    borderRadius: '30px',
                    position: 'relative' as const,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute' as const,
                      top: '20%',
                      left: '20%',
                      width: '60%',
                      height: '60%',
                      background: 'rgba(131, 56, 236, 0.3)',
                      borderRadius: '50%',
                      filter: 'blur(40px)',
                      animation: 'pulse 4s ease-in-out infinite'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          ...styles.featuresSection,
          width: '100%',
          margin: '0',
          padding: '8rem 0',
          position: 'relative'
        }}
      >
        <div style={styles.featuresContainer} className="features-container">
          <h2 style={styles.sectionTitle}>{t('features.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('features.subtitle')}</p>

          <div style={styles.featuresGrid} className="features-grid">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow =
                    '0 30px 60px rgba(0, 245, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={styles.featureIcon}>
                  {t(`features.items.${index}.icon`)}
                </span>
                <h3 style={styles.featureTitle}>
                  {t(`features.items.${index}.title`)}
                </h3>
                <p style={styles.featureDescription}>
                  {t(`features.items.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        style={{
          ...styles.howItWorksSection,
          width: '100%',
          margin: '0',
          padding: '8rem 0',
          position: 'relative'
        }}
      >
        <div style={styles.stepsContainer} className="steps-container">
          <h2 style={styles.sectionTitle}>{t('howItWorks.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('howItWorks.subtitle')}</p>

          <div style={styles.stepsGrid}>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} style={styles.stepRow} className="step-row">
                <div
                  style={{
                    ...styles.stepCard,
                    order: index % 2 === 0 ? 1 : 2
                  }}
                >
                  <span style={styles.stepIcon}>
                    {t(`howItWorks.steps.${index}.icon`)}
                  </span>
                  <h3 style={styles.stepTitle}>
                    {t(`howItWorks.steps.${index}.title`)}
                  </h3>
                  <p style={styles.stepDescription}>
                    {t(`howItWorks.steps.${index}.description`)}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    order: index % 2 === 0 ? 2 : 1
                  }}
                >
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #00f5ff, #ff006e)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      fontWeight: '900',
                      color: 'white'
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        style={{
          ...styles.testimonialsSection,
          width: '100%',
          margin: '0',
          padding: '8rem 0',
          position: 'relative'
        }}
      >
        <div
          style={styles.testimonialsContainer}
          className="testimonials-container"
        >
          <h2 style={styles.sectionTitle}>{t('testimonials.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('testimonials.subtitle')}</p>

          <div style={styles.testimonialsGrid} className="testimonials-grid">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                style={styles.testimonialCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-15px) rotate(2deg)';
                  e.currentTarget.style.boxShadow =
                    '0 30px 60px rgba(255, 0, 110, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(0) rotate(0deg)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <p style={styles.testimonialText}>
                  "{t(`testimonials.items.${index}.text`)}"
                </p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>
                    {t(`testimonials.items.${index}.author`).charAt(0)}
                  </div>
                  <div>
                    <div style={styles.testimonialName}>
                      {t(`testimonials.items.${index}.author`)}
                    </div>
                    <div style={styles.testimonialTitle}>
                      {t(`testimonials.items.${index}.title`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          ...styles.ctaSection,
          width: '100%',
          margin: '0',
          padding: '10rem 0',
          position: 'relative'
        }}
      >
        <div style={styles.ctaContainer} className="cta-container">
          <h2 style={styles.ctaTitle}>{t('cta.title')}</h2>
          <p style={styles.ctaSubtitle}>{t('cta.subtitle')}</p>
          <div style={styles.ctaButtons} className="cta-buttons">
            <button
              style={styles.primaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow =
                  '0 20px 50px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 10px 30px rgba(0, 245, 255, 0.3)';
              }}
              onClick={handleSignup}
            >
              {t('cta.buttons.signup')}
            </button>
            <button
              style={{
                ...styles.secondaryButton,
                borderColor: 'white',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
              onClick={handleLogin}
            >
              {t('cta.buttons.login')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          ...styles.footer,
          width: '100%',
          margin: '0',
          padding: '6rem 0 3rem 0',
          position: 'relative'
        }}
      >
        <div style={styles.footerContainer} className="footer-container">
          <div style={styles.footerLogo}>{t('footer.brand')}</div>
          <div style={styles.footerLinks} className="footer-links">
            <a href="https://heydivido.com" style={styles.footerLink}>
              {t('footer.links.website')}
            </a>
            <a href="#" style={styles.footerLink}>
              {t('footer.links.privacy')}
            </a>
            <a href="#" style={styles.footerLink}>
              {t('footer.links.terms')}
            </a>
            <a href="#" style={styles.footerLink}>
              {t('footer.links.support')}
            </a>
            <a href="#" style={styles.footerLink}>
              {t('footer.links.download')}
            </a>
          </div>
          <div style={styles.footerCopyright}>
            <p>{t('footer.copyright')}</p>
            <p>{t('footer.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
