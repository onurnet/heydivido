import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

import HomePage from './components/HomePage';
import {
  dummyUser,
  dummySummary,
  dummyEvents,
  dummyExpenses
} from './data/dummyData';

import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route
            path="/"
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
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;
