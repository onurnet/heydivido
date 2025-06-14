import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

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

import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import type { User, Summary, Event, Expense } from './types/types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<Summary>({
    total_events: 0,
    total_expenses: 0
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session check:', sessionData);

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

      if (sessionData?.session?.access_token) {
        if (currentPath === '/') {
          console.log('Redirecting to /home because session is active');
          window.location.href = '/home';
        } else if (shouldSkipRedirect) {
          console.log(`Skipping redirect on path: ${currentPath}`);
        } else {
          console.log('User is already on allowed page, no redirect needed');
        }
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const syncLanguage = async () => {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data, error } = await supabase
          .from('users')
          .select('preferred_lang')
          .eq('auth_user_id', authUser.id)
          .single();

        if (!error && data?.preferred_lang) {
          i18n.changeLanguage(data.preferred_lang);
          console.log('App language set to:', data.preferred_lang);
        } else {
          console.warn('Could not load preferred_lang:', error);
        }
      }
    };

    const fetchUserData = async () => {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (authUser) {
        console.log('🔍 DEBUG - authUser.id:', authUser.id);

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single();

        if (!userError && userData) {
          setUser(userData);
          console.log('✅ User data loaded:', userData);
          console.log('🔍 DEBUG - userData.id:', userData.id);
        } else {
          console.error('❌ User data error:', userError);
          return;
        }

        // Initialize variables for final summary
        let finalEvents = [];
        let finalExpenses = [];

        // 🔍 DEBUG: Fetch events
        console.log('🔍 DEBUG - Fetching events for authUser.id:', authUser.id);

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', authUser.id);

        console.log('🔍 DEBUG - eventData:', eventData);
        console.log('🔍 DEBUG - eventError:', eventError);

        if (!eventError && eventData) {
          finalEvents = eventData;
          setEvents(eventData);
          console.log('✅ Events loaded successfully:', eventData.length);
        } else {
          console.error('❌ Events loading failed:', eventError);
          finalEvents = [];
          setEvents([]);
        }

        // ✅ DÜZELTME: Expenses sorgusu
        console.log(
          '🔍 DEBUG - Fetching expenses for userData.id:',
          userData.id
        );

        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .select('*')
          .eq('paid_by', userData.id);

        console.log('🔍 DEBUG - expenseData:', expenseData);
        console.log('🔍 DEBUG - expenseError:', expenseError);

        if (!expenseError && expenseData && expenseData.length > 0) {
          // ✅ Amount field'larını number'a çevir (Supabase numeric → string olabilir)
          const processedExpenses = expenseData.map((expense) => ({
            ...expense,
            amount:
              typeof expense.amount === 'string'
                ? parseFloat(expense.amount)
                : expense.amount || 0
          }));

          console.log('🔍 DEBUG - Processed expenses:', processedExpenses);
          console.log(
            '🔍 DEBUG - Sample amount type:',
            typeof processedExpenses[0]?.amount
          );

          finalExpenses = processedExpenses;
          setExpenses(processedExpenses);
          console.log(
            '✅ Expenses loaded successfully:',
            processedExpenses.length
          );
        } else {
          console.error('❌ Direct expenses loading failed:', expenseError);

          // 🔧 ALTERNATIVE: expenses_participants tablosu üzerinden
          console.log('🔧 Trying expenses_participants table...');
          const { data: participantExpenses, error: participantError } =
            await supabase
              .from('expenses_participants')
              .select('expense_id, expenses(*)')
              .eq('user_id', userData.id);

          console.log('🔍 DEBUG - Participant expenses:', participantExpenses);

          if (
            !participantError &&
            participantExpenses &&
            participantExpenses.length > 0
          ) {
            const expensesFromParticipants = participantExpenses
              .map((p) => p.expenses)
              .filter((exp) => exp !== null)
              .map((expense) => ({
                ...expense,
                amount:
                  typeof expense.amount === 'string'
                    ? parseFloat(expense.amount)
                    : expense.amount || 0
              }));

            console.log(
              '🔧 Expenses from participants table:',
              expensesFromParticipants
            );

            if (expensesFromParticipants.length > 0) {
              finalExpenses = expensesFromParticipants;
              setExpenses(expensesFromParticipants);
              console.log(
                '✅ Expenses loaded via participants table:',
                expensesFromParticipants.length
              );
            } else {
              finalExpenses = [];
              setExpenses([]);
            }
          } else {
            finalExpenses = [];
            setExpenses([]);
          }
        }

        // ✅ DÜZELTME: Summary'yi state'lerden değil direkt data'dan hesapla
        const totalExpenseAmount = finalExpenses.reduce((acc, expense) => {
          const amount =
            typeof expense.amount === 'number' ? expense.amount : 0;
          console.log(
            `🔍 Adding expense amount: ${amount} (type: ${typeof amount})`
          );
          return acc + amount;
        }, 0);

        console.log(
          '🔍 DEBUG - Total expense amount calculated:',
          totalExpenseAmount
        );
        console.log('🔍 DEBUG - Final expenses count:', finalExpenses.length);
        console.log('🔍 DEBUG - Final events count:', finalEvents.length);

        // ✅ Summary'yi son anda set et
        const finalSummary = {
          total_events: finalEvents.length,
          total_expenses: totalExpenseAmount
        };

        console.log('🔍 DEBUG - Final summary:', finalSummary);
        setSummary(finalSummary);

        // ✅ Debug: Verify state will be set correctly
        console.log('✅ States will be set to:');
        console.log('  - Events:', finalEvents.length);
        console.log('  - Expenses:', finalExpenses.length);
        console.log('  - Total expense amount:', totalExpenseAmount);
      } else {
        console.warn('⚠️ No authenticated user found');
      }
    };

    syncLanguage();
    fetchUserData();
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
                  summary={summary}
                  events={events}
                  expenses={expenses}
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
