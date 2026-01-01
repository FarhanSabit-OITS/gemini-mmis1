
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Store, Loader2, ShieldCheck } from 'lucide-react';
import { Sidebar } from './Sidebar.tsx';
import { UserProfile } from '../../types.ts';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Header } from '../ui/Header.tsx';
import { Footer } from '../ui/Footer.tsx';
import { Chatbot } from './Chatbot.tsx';
import { NotificationCenter } from './NotificationCenter.tsx';
import { Home } from './Home.tsx';

// Lazy loading components with explicit extensions for ESM compatibility
const WalletModule = lazy(() => import('./WalletModule.tsx').then(m => ({ default: m.WalletModule })));
const OrdersManagement = lazy(() => import('./OrdersManagement.tsx').then(m => ({ default: m.OrdersManagement })));
const VendorManagement = lazy(() => import('./VendorManagement.tsx').then(m => ({ default: m.VendorManagement })));
const SuppliersNetwork = lazy(() => import('./SuppliersNetwork.tsx').then(m => ({ default: m.SuppliersNetwork })));
const SupplierManagement = lazy(() => import('./SupplierManagement.tsx').then(m => ({ default: m.SupplierManagement })));
const SupplyRequisitions = lazy(() => import('./SupplyRequisitions.tsx').then(m => ({ default: m.SupplyRequisitions })));
const MarketRegistry = lazy(() => import('./MarketRegistry.tsx').then(m => ({ default: m.MarketRegistry })));
const InteractiveMap = lazy(() => import('./InteractiveMap.tsx').then(m => ({ default: m.InteractiveMap })));
const InventoryManagement = lazy(() => import('./InventoryManagement.tsx').then(m => ({ default: m.InventoryManagement })));
const AuditLogs = lazy(() => import('./AuditLogs.tsx').then(m => ({ default: m.AuditLogs })));
const QRManagement = lazy(() => import('./QRManagement.tsx').then(m => ({ default: m.QRManagement })));
const GateManagement = lazy(() => import('./GateManagement.tsx').then(m => ({ default: m.GateManagement })));
const StockCounterTerminal = lazy(() => import('./StockCounterTerminal.tsx').then(m => ({ default: m.StockCounterTerminal })));
const VendorOnboarding = lazy(() => import('./VendorOnboarding.tsx').then(m => ({ default: m.VendorOnboarding })));
const SecurityModule = lazy(() => import('./SecurityModule.tsx').then(m => ({ default: m.SecurityModule })));
const RevenueModule = lazy(() => import('./RevenueModule.tsx').then(m => ({ default: m.RevenueModule })));
const TicketingSystem = lazy(() => import('./TicketingSystem.tsx').then(m => ({ default: m.TicketingSystem })));
const ProfileSettings = lazy(() => import('./ProfileSettings.tsx').then(m => ({ default: m.ProfileSettings })));

interface DashboardLayoutProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  onLogout: () => void;
}

export const DashboardLayout = ({ user, setUser, onLogout }: DashboardLayoutProps) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isVendorOnboarding, setIsVendorOnboarding] = useState(false);
  
  // Robust Dark Mode Logic
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('mmis_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // 2. Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply class and listen for system changes
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // System preference listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference in this session/storage
      const saved = localStorage.getItem('mmis_theme');
      if (!saved) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('mmis_theme', newMode ? 'dark' : 'light');
  };

  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fade-in bg-white dark:bg-slate-900 rounded-[48px] border border-slate-50 dark:border-slate-800 shadow-inner">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      <div className="mt-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Syncing Module Ledger</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isVendorOnboarding) {
       return <VendorOnboarding user={user} onComplete={() => { setIsVendorOnboarding(false); setActiveTab('Home'); }} />;
    }

    let component;
    switch (activeTab) {
      case 'Home': component = <Home user={user} />; break;
      case 'My Wallet': component = <WalletModule user={user} />; break;
      case 'Orders': component = <OrdersManagement user={user} />; break;
      case 'Vendors':
      case 'My Store':
        if (user.role === 'USER' && !isVendorOnboarding) {
           return (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fade-in">
                <Card className="max-w-md p-12 rounded-[48px] shadow-2xl border-none bg-white dark:bg-slate-900 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                   <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <Store size={48}/>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Node Inactive</h3>
                   <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">You are currently accessing the system as a <strong>Standard User</strong>. To activate your trade entity, please complete the onboarding sequence.</p>
                   <Button onClick={() => setIsVendorOnboarding(true)} className="w-full h-16 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 dark:shadow-indigo-950/20 bg-indigo-600 text-white border-none">Initialize Onboarding</Button>
                </Card>
             </div>
           );
        }
        component = <VendorManagement user={user} />; break;
      case 'Suppliers Network': 
        component = user.role === 'SUPPLIER' ? <SupplierManagement user={user} /> : <SuppliersNetwork user={user} />; 
        break;
      case 'Supply Requisitions': component = <SupplyRequisitions user={user} />; break;
      case 'Markets': component = <MarketRegistry user={user} />; break;
      case 'Map View': component = <InteractiveMap user={user} />; break;
      case 'Inventory Control': component = <InventoryManagement user={user} />; break;
      case 'Admin Roles': 
        component = (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white">Administrative Permissions</h2>
            <Card className="p-16 text-center rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
               <ShieldCheck className="mx-auto mb-6 text-indigo-600 opacity-20" size={80}/>
               <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">Credential Manager Synchronized</p>
            </Card>
          </div>
        );
        break;
      case 'Audit Logs': component = <AuditLogs />; break;
      case 'QR & Receipts': component = <QRManagement />; break;
      case 'Gate Management': component = <GateManagement />; break;
      case 'Stock Counter': component = <StockCounterTerminal />; break;
      case 'Security Console': component = <SecurityModule />; break;
      case 'Revenue Module': component = <RevenueModule />; break;
      case 'Tickets & Support': component = <TicketingSystem user={user} />; break;
      case 'Settings': component = <ProfileSettings user={user} setUser={setUser} />; break;
      default: component = <Home user={user} />;
    }

    return (
      <Suspense fallback={<LoadingFallback />}>
        {component}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <div className="flex flex-1 overflow-hidden">
        {!isVendorOnboarding && (
          <Sidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
            onLogout={onLogout}
          />
        )}

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950">
          {!isVendorOnboarding && (
            <Header 
              user={user} 
              onLogout={onLogout} 
              onLogoClick={() => setActiveTab('Home')}
              onNotificationClick={() => setShowNotifications(!showNotifications)}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleTheme}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          
          <div className="relative">
            {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
          </div>

          <main className={`flex-1 p-8 max-w-7xl mx-auto w-full ${isVendorOnboarding ? 'flex items-center justify-center' : ''}`}>
            {renderContent()}
          </main>
          
          {!isVendorOnboarding && <Footer />}
        </div>
      </div>
      {!isVendorOnboarding && <Chatbot />}
    </div>
  );
};
