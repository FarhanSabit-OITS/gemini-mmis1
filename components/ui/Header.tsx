import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Store, Bell, Search, User as UserIcon, LogOut, Sun, Moon, 
  Package, ArrowRight, X, ShoppingBag, ShoppingCart, 
  Truck, LayoutGrid, FileText, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  user?: UserProfile | null;
  onLogout?: () => void;
  onLogoClick?: () => void;
  showSearch?: boolean;
  isSimplified?: boolean;
  onNotificationClick?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  onNavigate?: (tab: string) => void;
}

const levenshteinDistance = (a: string, b: string) => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
};

export const Header = ({ user, onLogout, onLogoClick, showSearch = true, isSimplified = false, onNotificationClick, isDarkMode, toggleDarkMode, onNavigate }: HeaderProps) => {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const registryMock = useMemo(() => [
    { type: 'VENDOR', name: 'Global Tech Solution', id: 'V-001', category: 'Registry Nodes', icon: Store, target: 'Vendors' },
    { type: 'PRODUCT', name: 'Premium Basmati Rice', id: 'P-101', category: 'Catalog Items', icon: Package, target: 'Inventory Control' },
    { type: 'ORDER', name: 'ORD-1001 (Maize Flour)', id: 'O-001', category: 'Order Manifests', icon: ShoppingCart, target: 'Orders' },
    { type: 'LOGISTICS', name: 'Weekly Bridge W21', id: 'L-001', category: 'Logistics', icon: Truck, target: 'Supply Requisitions' },
  ], []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 1) return [];
    
    return registryMock.map(item => {
      let score = 0;
      const name = item.name.toLowerCase();
      const id = item.id.toLowerCase();

      if (name === q || id === q) score += 100;
      else if (name.startsWith(q) || id.startsWith(q)) score += 80;
      else if (name.includes(q) || id.includes(q)) score += 60;
      else {
        const similarity = 1 - (levenshteinDistance(name, q) / Math.max(name.length, q.length));
        if (similarity > 0.6) score += 40 * similarity;
      }
      return { ...item, score };
    }).filter(i => i.score > 0).sort((a, b) => b.score - a.score);
  }, [searchQuery, registryMock]);

  return (
    <header className="h-24 glass sticky top-0 z-40 flex items-center justify-between px-8 border-b transition-all duration-300">
      <div className="flex items-center gap-4 flex-1" onClick={onLogoClick}>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group cursor-pointer hover:scale-105 transition-transform">
          <Store className="text-white" size={28} />
        </div>
        <div className="hidden sm:block cursor-pointer">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">MMIS</h1>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Regional HUB</p>
        </div>
      </div>

      {!isSimplified && (
        <div className="flex items-center gap-6 relative" ref={searchRef}>
          {showSearch && (
            <div className={`relative transition-all duration-500 ease-out ${isSearchFocused ? 'w-[480px]' : 'w-72'}`}>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearchFocused ? 'text-indigo-500' : 'text-slate-400'}`} size={20} />
              <input 
                placeholder="Registry Discovery Engine..." 
                value={inputValue}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 rounded-2xl pl-12 pr-10 py-3 text-sm w-full outline-none font-bold" 
              />
              {isSearchFocused && searchQuery && (
                <div className="absolute top-full mt-4 left-0 right-0 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border overflow-hidden animate-slide-up z-50">
                  <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                    {searchResults.map((item, idx) => (
                      <button key={idx} onClick={() => { onNavigate?.(item.target); setIsSearchFocused(false); setInputValue(''); }} className="w-full text-left px-4 py-3 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"><item.icon size={16} className="text-slate-400" /></div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black dark:text-white truncate">{item.name}</span>
                            <span className="text-[9px] opacity-40 font-mono tracking-tighter">{item.id} • {item.category}</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                    {searchResults.length === 0 && <div className="p-8 text-center text-[10px] font-black uppercase text-slate-400">Node Not Triangulated</div>}
                  </div>
                </div>
              )}
            </div>
          )}
          {user && (
            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-all">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
              <button onClick={onNotificationClick} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl relative"><Bell size={20}/><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
              <div className="flex items-center gap-3 group relative cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase leading-none">{user.name}</p>
                  <p className="text-[8px] font-black text-indigo-600 uppercase mt-1">{user.role}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-sm font-black shadow-xl">{user.name.charAt(0)}</div>
                <div className="absolute right-0 top-full mt-4 w-48 bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[60]">
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-black uppercase text-red-600 hover:bg-red-50 rounded-xl"><LogOut size={16}/> Logout Protocol</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};