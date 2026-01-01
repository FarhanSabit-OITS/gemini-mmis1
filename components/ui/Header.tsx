
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Store, Bell, Search, User as UserIcon, LogOut, Sun, Moon, 
  Package, ArrowRight, X, ShoppingBag, ShoppingCart, 
  Truck, LayoutGrid, FileText, CheckCircle2, AlertCircle
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

// Levenshtein Distance for robust fuzzy matching - Moved outside for performance
const levenshteinDistance = (a: string, b: string) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const Header = ({ 
  user, 
  onLogout, 
  onLogoClick,
  showSearch = true, 
  isSimplified = false,
  onNotificationClick,
  isDarkMode,
  toggleDarkMode,
  onNavigate
}: HeaderProps) => {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Comprehensive Registry Mock Data with expanded fields for fuzzy search
  const registryMock = useMemo(() => [
    { type: 'VENDOR', name: 'Global Tech Solution', id: 'V-001', category: 'Registry Nodes', icon: Store, target: 'Vendors', status: 'Active' },
    { type: 'VENDOR', name: 'Fresh Foods Co.', id: 'V-002', category: 'Registry Nodes', icon: Store, target: 'Vendors', status: 'Active' },
    { type: 'VENDOR', name: 'Mukasa General Trade', id: 'V-003', category: 'Registry Nodes', icon: Store, target: 'Vendors', status: 'Pending' },
    { type: 'PRODUCT', name: 'Premium Basmati Rice', id: 'P-101', category: 'Catalog Items', icon: Package, target: 'Inventory Control', sub: 'Grain' },
    { type: 'PRODUCT', name: 'Refined White Sugar', id: 'P-102', category: 'Catalog Items', icon: Package, target: 'Inventory Control', sub: 'Pantry' },
    { type: 'PRODUCT', name: 'Solar Lantern X1', id: 'P-103', category: 'Catalog Items', icon: Package, target: 'Inventory Control', sub: 'Electronics' },
    { type: 'ORDER', name: 'ORD-1001 (Maize Flour)', id: 'O-001', category: 'Order Manifests', icon: ShoppingCart, target: 'Orders', status: 'Pending' },
    { type: 'ORDER', name: 'ORD-1002 (Cooking Oil)', id: 'O-002', category: 'Order Manifests', icon: ShoppingCart, target: 'Orders', status: 'Shipped' },
    { type: 'ORDER', name: 'ORD-8821 (Industrial Salt)', id: 'O-003', category: 'Order Manifests', icon: ShoppingCart, target: 'Orders', status: 'Delivered' },
    { type: 'LOGISTICS', name: 'Weekly Bridge W21', id: 'L-001', category: 'Logistics', icon: Truck, target: 'Supply Requisitions', status: 'En Route' },
    { type: 'MODULE', name: 'Revenue Analytics', id: 'MOD-REV', category: 'System Modules', icon: LayoutGrid, target: 'Revenue Module' },
    { type: 'MODULE', name: 'Security Console', id: 'MOD-SEC', category: 'System Modules', icon: FileText, target: 'Security Console' },
  ], []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 1) return [];
    
    // Advanced Scoring Logic
    const scoredResults = registryMock.map(item => {
      let score = 0;
      const name = item.name.toLowerCase();
      const id = item.id.toLowerCase();
      const sub = (item.sub || '').toLowerCase();

      // 1. Exact Match (Highest Priority)
      if (name === q || id === q) score += 100;
      
      // 2. Starts With (High Priority)
      else if (name.startsWith(q) || id.startsWith(q)) score += 80;
      
      // 3. Contains (Medium Priority)
      else if (name.includes(q) || id.includes(q) || sub.includes(q)) score += 60;
      
      // 4. Levenshtein Fuzzy Match (Typo Tolerance)
      else {
        const dist = levenshteinDistance(name, q);
        const maxLength = Math.max(name.length, q.length);
        const similarity = 1 - dist / maxLength;
        
        // Threshold for fuzzy match (e.g., 60% similarity)
        if (similarity > 0.6) {
          score += 40 * similarity;
        }
      }

      return { ...item, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    // Grouping by category
    return scoredResults.reduce((acc, current) => {
      const group = acc.find((g: any) => g.category === current.category);
      if (group) {
        group.items.push(current);
      } else {
        acc.push({ category: current.category, icon: current.icon, target: current.target, items: [current] });
      }
      return acc;
    }, [] as any[]);
  }, [searchQuery, registryMock]);

  const handleResultClick = (target: string) => {
    setIsSearchFocused(false);
    setInputValue('');
    setSearchQuery('');
    if (onNavigate) onNavigate(target);
  };

  return (
    <header className="h-24 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8 border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 group cursor-pointer"
          title="Return to Hub Home"
        >
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Store className="text-white" size={28} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">MMIS</h1>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">Regional HUB</p>
          </div>
        </div>
      </div>

      {!isSimplified && (
        <div className="flex items-center gap-6 relative">
          {showSearch && (
            <div className="relative hidden lg:block" ref={searchRef}>
              <div className={`relative transition-all duration-500 ease-out ${isSearchFocused ? 'w-[480px]' : 'w-72'}`}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-indigo-500' : 'text-slate-400'}`} size={20} />
                <input 
                  placeholder="Registry Discovery Engine..." 
                  value={inputValue}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl pl-12 pr-10 py-3 text-sm w-full focus:bg-white dark:focus:bg-slate-950 transition-all outline-none text-slate-800 dark:text-slate-100 font-bold shadow-inner" 
                />
                {inputValue && (
                  <button onClick={() => { setInputValue(''); setSearchQuery(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16}/>
                  </button>
                )}
              </div>

              {isSearchFocused && (
                <div className="absolute top-full mt-4 left-0 right-0 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up ring-8 ring-black/5 z-50">
                   {inputValue.length < 1 ? (
                      <div className="p-8 text-center text-slate-400">
                         <Search size={40} className="mx-auto mb-3 opacity-10"/>
                         <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Registry Logic...</p>
                      </div>
                   ) : searchResults.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                         <Package className="mx-auto mb-3 opacity-10" size={40} />
                         <p className="text-[10px] font-black uppercase tracking-widest">Node Not Triangulated</p>
                      </div>
                   ) : (
                      <div className="p-2 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {searchResults.map((group, i) => (
                          <div key={i}>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-2 flex items-center gap-2">
                               <group.icon size={12}/> {group.category}
                            </p>
                            <div className="space-y-1 px-1">
                              {group.items.map((item: any, j: number) => (
                                <button 
                                  key={j} 
                                  onClick={()=>handleResultClick(item.target)} 
                                  className="w-full text-left px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                                      <item.icon size={16} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-black truncate">{item.name}</span>
                                      <span className="text-[9px] opacity-40 font-mono tracking-tighter flex items-center gap-2">
                                        {item.id}
                                        {item.sub && <span className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-[8px]">{item.sub}</span>}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {item.status && <span className="text-[8px] font-black uppercase opacity-60 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{item.status}</span>}
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                   )}
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center border-t border-slate-100 dark:border-slate-800">
                      <button className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline tracking-widest">Access Universal Ledger</button>
                   </div>
                </div>
              )}
            </div>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                title={isDarkMode ? 'Deactivate Dark Protocol' : 'Initialize Dark Protocol'}
              >
                {isDarkMode ? <Sun size={20} className="animate-spin-slow"/> : <Moon size={20} />}
              </button>

              <button 
                onClick={onNotificationClick}
                className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
              </button>
              
              <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
              
              <div className="flex items-center gap-3 group relative">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">{user.name}</p>
                  <p className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1.5 opacity-80">{user.role}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white text-sm font-black ring-4 ring-slate-100 dark:ring-slate-800 cursor-pointer shadow-xl hover:scale-105 transition-transform">
                  {user.name.charAt(0)}
                </div>
                
                {onLogout && (
                   <div className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3 ring-8 ring-black/5 z-[60]">
                     <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 mb-2">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{user.email}</p>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Terminal ID: {user.id.slice(-8).toUpperCase()}</p>
                     </div>
                     <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-colors tracking-widest">
                       <LogOut size={18} /> Purge Session
                     </button>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
