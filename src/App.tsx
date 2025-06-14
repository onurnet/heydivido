import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import type { User, Event, Expense, Summary } from './types/types';

import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AddEvent from './pages/AddEvent';
import EventDetails from './pages/EventDetails';
import EventDetailsEdit from './pages/EventDetailsEdit';
import Events from './pages/Events';
import AddExpense from './pages/AddExpense';
import InvitePage from './pages/InvitePage';
import ExpenseEdit from './pages/ExpenseEdit';
import SettlementPage from './pages/SettlementPage';
import AllExpensesPage from './pages/AllExpensesPage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_events: 0,
    total_expenses: 0
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const pathsToSkipRedirect = [
        '/invite',
        '/events',
        '/login',
        '/register',
        '/profile'
      ];
      const currentPath = window.location.pathname;
      const shouldSkipRedirect = pathsToSkipRedirect.some((path) =>
        currentPath.startsWith(path)
      );
      if (sessionData?.session?.access_token && currentPath === '/') {
        window.location.href = '/home';
      } else if (!shouldSkipRedirect) {
        console.log(`Skipping redirect on path: ${currentPath}`);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (!authUser) return;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (!userData) return;

      setUser(userData);
      if (userData.preferred_lang) i18n.changeLanguage(userData.preferred_lang);

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', authUser.id);

      setEvents(eventData || []);

      const { data: expenseData } = await supabase
        .from('expenses')
        .select('*')
        .eq('paid_by', userData.id);

      const parsedExpenses =
        expenseData?.map((e) => ({
          ...e,
          amount: typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount
        })) || [];

      setExpenses(parsedExpenses);

      setSummary({
        total_events: eventData?.length || 0,
        total_expenses: parsedExpenses.reduce(
          (acc, e) => acc + (e.amount || 0),
          0
        )
      });
    };

    fetchAllData();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
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
              user ? (
                <HomePage
                  user={user}
                  events={events}
                  expenses={expenses}
                  summary={summary}
                />
              ) : (
                <div>Yükleniyor...</div>
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/events/:eventId/edit" element={<EventDetailsEdit />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route path="/all-expenses" element={<AllExpensesPage />} />
          <Route
            path="/events/:eventId/settlement"
            element={<SettlementPage />}
          />
          <Route
            path="/events/:eventId/settlements"
            element={<SettlementPage />}
          />
          <Route
            path="/events/:eventId/expenses/:expenseId/edit"
            element={<ExpenseEdit />}
          />
          <Route path="/events/:eventId/add-expense" element={<AddExpense />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;
