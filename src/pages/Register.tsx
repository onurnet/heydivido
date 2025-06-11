import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [iban, setIban] = React.useState('');
  const [ibanCurrency, setIbanCurrency] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [city, setCity] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const generateBubino = (): string => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `GZ${randomNumber}`;
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Registration failed - no user returned');
        setLoading(false);
        return;
      }

      // Step 2: Insert user details into users table
      const bubino = generateBubino();

      const { error: dbError } = await supabase.from('users').insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        iban: iban,
        iban_currency: ibanCurrency,
        country: country,
        city: city,
        bubino: bubino
      });

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }

      // Step 3: Navigate to login on success
      navigate('/login');
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const isFormValid =
    firstName &&
    lastName &&
    email &&
    password &&
    phone &&
    iban &&
    ibanCurrency &&
    country &&
    city;

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '0 auto',
    background: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: '"Inter", system-ui, sans-serif',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const formContainerStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(74,144,226,0.1)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '32px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px',
    fontFamily: '"Inter", system-ui, sans-serif',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const inputFocusStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#4A90E2',
    boxShadow: '0 0 0 3px rgba(74,144,226,0.1)'
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px'
  };

  const halfWidthInputStyle: React.CSSProperties = {
    ...inputStyle,
    flex: 1
  };

  const halfWidthInputFocusStyle: React.CSSProperties = {
    ...halfWidthInputStyle,
    borderColor: '#4A90E2',
    boxShadow: '0 0 0 3px rgba(74,144,226,0.1)'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #27ae60 0%, #219a52 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px'
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: 'not-allowed'
  };

  const errorStyle: React.CSSProperties = {
    color: '#e74c3c',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px',
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '8px'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>{t('register_title')}</h1>

        <div style={rowStyle}>
          <input
            type="text"
            placeholder={t('first_name_placeholder')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={halfWidthInputStyle}
            onFocus={(e) =>
              Object.assign(e.target.style, halfWidthInputFocusStyle)
            }
            onBlur={(e) => Object.assign(e.target.style, halfWidthInputStyle)}
          />
          <input
            type="text"
            placeholder={t('last_name_placeholder')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={halfWidthInputStyle}
            onFocus={(e) =>
              Object.assign(e.target.style, halfWidthInputFocusStyle)
            }
            onBlur={(e) => Object.assign(e.target.style, halfWidthInputStyle)}
          />
        </div>

        <input
          type="email"
          placeholder={t('email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        <input
          type="password"
          placeholder={t('password_placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        <input
          type="tel"
          placeholder={t('phone_placeholder')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        <div style={rowStyle}>
          <input
            type="text"
            placeholder={t('iban_placeholder')}
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            style={halfWidthInputStyle}
            onFocus={(e) =>
              Object.assign(e.target.style, halfWidthInputFocusStyle)
            }
            onBlur={(e) => Object.assign(e.target.style, halfWidthInputStyle)}
          />
          <input
            type="text"
            placeholder={t('iban_currency_placeholder')}
            value={ibanCurrency}
            onChange={(e) => setIbanCurrency(e.target.value)}
            style={halfWidthInputStyle}
            onFocus={(e) =>
              Object.assign(e.target.style, halfWidthInputFocusStyle)
            }
            onBlur={(e) => Object.assign(e.target.style, halfWidthInputStyle)}
          />
        </div>

        <div style={rowStyle}>
          <input
            type="text"
            placeholder={t('country_placeholder')}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={halfWidthInputStyle}
            onFocus={(e) =>
              Object.assign(e.target.style, halfWidthInputFocusStyle)
            }
            onBlur={(e) => Object.assign(e.target.style, halfWidthInputStyle)}
          />
          <input
            type="text"
            placeholder={t('city_placeholder')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={halfWidthInputStyle}
            onFocus={(e) =>
              Object.assign(e.target.style, halfWidthInputFocusStyle)
            }
            onBlur={(e) => Object.assign(e.target.style, halfWidthInputStyle)}
          />
        </div>

        {error && (
          <div style={errorStyle}>
            {t('register_error')}: {error}
          </div>
        )}

        <button
          onClick={handleRegister}
          style={!isFormValid || loading ? buttonDisabledStyle : buttonStyle}
          disabled={!isFormValid || loading}
          onMouseEnter={(e) => {
            if (!loading && isFormValid) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 4px 15px rgba(39,174,96,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? t('register_loading') : t('register_button')}
        </button>
      </div>
    </div>
  );
};

export default Register;
