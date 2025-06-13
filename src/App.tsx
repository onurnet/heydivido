import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import {
  dummyUser,
  dummySummary,
  dummyEvents,
  dummyExpenses
} from './data/dummyData';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// ⬇️ Toast eklemek için import
import { Toaster } from 'react-hot-toast';

// ⬇️ Supabase import
import { supabase } from './supabaseClient';

function App() {
  // 🚀 Check session and redirect to /home if needed
  React.useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session check:', sessionData);

      if (sessionData?.session?.access_token) {
        // Eğer zaten HomePage'deysek tekrar yönlendirme yapma
        if (window.location.pathname !== '/home') {
          console.log('Redirecting to /home because session is active');
          window.location.href = '/home';
        }
      }
    };

    checkSession();
  }, []);

  // 🚀 Sync language with preferred_lang from users table
  React.useEffect(() => {
    const syncLanguage = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('preferred_lang')
          .eq('auth_user_id', user.id)
          .single();

        if (!error && data?.preferred_lang) {
          i18n.changeLanguage(data.preferred_lang);
          console.log('App language set to:', data.preferred_lang);
        } else {
          console.warn('Could not load preferred_lang:', error);
        }
      }
    };

    syncLanguage();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        {/* Toaster componentini en üste koyuyoruz */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: 'rgba(26, 26, 46, 0.95)',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px'
            }
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={
              <HomePage
                user={dummyUser}
                summary={dummySummary}
                events={dummyEvents}
                expenses={dummyExpenses}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;
