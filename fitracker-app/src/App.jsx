import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

import { supabase } from './utils/supabaseClient';

export default function FiTrackerPlan() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'app'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 1. Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Prefer username from metadata, fallback to email part
        const username = session.user.user_metadata?.username || session.user.email.split('@')[0];
        setCurrentUser(username);
        setView('app');
      }
    });

    // 2. Listen for auth changes (SignIn, SignOut, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const username = session.user.user_metadata?.username || session.user.email.split('@')[0];
        setCurrentUser(username);
        setView('app');
      } else {
        setCurrentUser(null);
        // Optional: redirect to landing if logged out, 
        // but checking 'view' state to avoid overriding navigation between public pages is tricky.
        // For now, if logged out, we just clear user. 
        // If we were in 'app', we should go to 'landing'.
        setView(prev => prev === 'app' ? 'landing' : prev);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
    setView('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('landing');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <LandingPage
              onLoginClick={() => setView('login')}
              onRegisterClick={() => setView('register')}
            />
          </motion.div>
        )}
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setView('register')}
              onBack={() => setView('landing')}
            />
          </motion.div>
        )}
        {view === 'register' && (
          <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <RegisterPage
              onRegisterSuccess={() => setView('login')}
              onSwitchToLogin={() => setView('login')}
              onBack={() => setView('landing')}
            />
          </motion.div>
        )}
        {view === 'app' && (
          <motion.div key="app" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }}>
            <Dashboard
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
