
import React from 'react';
import { 
  LayoutDashboard, Store, Package, Users, ShieldCheck, 
  Settings, LogOut, MessageSquare, History, Ticket, 
  Truck, Box, UserPlus, CreditCard, Building2, 
  Warehouse, Boxes, Map as MapIcon, HeartHandshake, 
  LifeBuoy, ShoppingBag, ShoppingCart, Shield, 
  Landmark, Wallet, Lock, UserCog
} from 'lucide-react';
import { Role, UserProfile } from '../../types.ts';
import { ROLES_HIERARCHY } from '../../constants.ts';

interface SidebarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

export const Sidebar = ({ user, activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: SidebarProps) => {
  
  const canSee = (item: { name: string, roles?: Role[] }) => {
    // 1. No roles restriction means everyone sees it
    if (!item.roles) return true;

    // 2. Direct Role Match
    if (item.roles.includes(user.role)) return true;

    // 3. Super Admin Universal Access
    if (user.role === 'SUPER_ADMIN') return true;

    // 4. Hierarchy Check: If any permitted roles are supervised by the current user's role
    const supervisedRoles = ROLES_HIERARCHY[user.role] || [];
    const hasAccess = item.roles.some(permittedRole => supervisedRoles.includes(permittedRole));
    
    return hasAccess;
  };

  const menuItems = [
    { name: 'Home', icon: LayoutDashboard },
    { name: 'My Wallet', icon: Wallet },
    { name: 'Markets', icon: Building2, roles: ['MARKET_ADMIN'] as Role[] },
    { name: 'Map View', icon: MapIcon, roles: ['VENDOR', 'SUPPLIER', 'COUNTER_STAFF'] as Role[] },
    { name: user.role === 'VENDOR' ? 'My Store' : 'Vendors', icon: Store, roles: ['MARKET_ADMIN', 'VENDOR'] as Role[] },
    { name: 'Orders', icon: ShoppingCart, roles: ['VENDOR', 'USER'] as Role[] },
    { name: 'Suppliers Network', icon: HeartHandshake, roles: ['SUPPLIER', 'VENDOR', 'USER'] as Role[] },
    { name: 'Supply Requisitions', icon: ShoppingBag, roles: ['SUPPLIER', 'VENDOR'] as Role[] },
    { name: 'Inventory Control', icon: Box, roles: ['VENDOR', 'SUPPLIER'] as Role[] },
    // Restricted Modules
    { name: 'Admin Roles', icon: Lock, roles: ['MARKET_ADMIN'] as Role[] },
    { name: 'Security Console', icon: Shield, roles: ['MARKET_ADMIN'] as Role[] },
    
    { name: 'Revenue Module', icon: Landmark, roles: ['MARKET_ADMIN'] as Role[] },
    { name: 'Gate Management', icon: Truck, roles: ['COUNTER_STAFF'] as Role[] },
    { name: 'Stock Counter', icon: Boxes, roles: ['COUNTER_STAFF'] as Role[] },
    { name: 'QR & Receipts', icon: Ticket, roles: ['COUNTER_STAFF', 'VENDOR'] as Role[] },
    { name: 'Tickets & Support', icon: LifeBuoy },
    { name: 'Audit Logs', icon: History, roles: ['MARKET_ADMIN'] as Role[] },
    { name: 'Settings', icon: Settings },
  ].filter(item => canSee(item));

  return (
    <aside className={`bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-500 h-screen sticky top-0 z-50 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center gap-3">
        <div 
          className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg cursor-pointer hover:rotate-90 transition-transform duration-500" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <Store className="text-white" size={24} />
        </div>
        {isOpen && (
          <div className="animate-fade-in">
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">MMIS</h1>
            <div className="w-8 h-1 bg-indigo-600 rounded-full mt-0.5"></div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${
              activeTab === item.name 
              ? 'bg-indigo-600 text-white shadow-indigo-100 dark:shadow-indigo-950/20 shadow-lg' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} className={activeTab === item.name ? 'scale-110 transition-transform' : 'group-hover:scale-110 transition-transform'} />
            {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>}
            {activeTab === item.name && !isOpen && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100]">
                {item.name}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all group`}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">Logout Protocol</span>}
        </button>
      </div>
    </aside>
  );
};
