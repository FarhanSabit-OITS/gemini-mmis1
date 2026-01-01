import React, { useState, useEffect } from 'react';
import { UserProfile } from './types.ts';
import { AuthPage } from './components/auth/AuthPage.tsx';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard.tsx';
import { DashboardLayout } from './components/dashboard/DashboardLayout.tsx';

export const App = () => {
  const [view, setView] = useState<'AUTH' | 'ONBOARDING' | 'DASHBOARD'>('AUTH');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Persistence check (simulation)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mmis_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView('DASHBOARD');
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
      localStorage.removeItem('mmis_user');
    }
  }, []);

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('mmis_user', JSON.stringify(userData));
    setView('ONBOARDING');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mmis_user');
    setView('AUTH');
  };

  const handleCompleteOnboarding = () => {
    setView('DASHBOARD');
  };

  return (
    <div className="antialiased text-slate-900 min-h-screen">
      {view === 'AUTH' && (
        <AuthPage 
          onSuccess={handleLogin} 
        />
      )}
      
      {view === 'ONBOARDING' && user && (
        <OnboardingWizard 
          user={user} 
          onComplete={handleCompleteOnboarding}
          onCancel={handleLogout}
        />
      )}
      
      {view === 'DASHBOARD' && user && (
        <DashboardLayout 
          user={user} 
          setUser={setUser} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};