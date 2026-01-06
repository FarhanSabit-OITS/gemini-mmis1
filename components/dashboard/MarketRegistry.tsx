import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, MapPin, Plus, Search, Filter, Calendar, 
  Users, Briefcase, Globe, ExternalLink, ShieldAlert, 
  TrendingUp, BarChart as ChartIcon, LayoutGrid, ChevronDown, ArrowUpDown,
  Navigation, Info, Sparkles, X, Map as MapIcon, RefreshCw, PieChart as PieIcon,
  Landmark
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { bff } from '../../lib/bff.ts';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserProfile, Market } from '../../types.ts';
import { MOCK_MARKETS } from '../../constants.ts';

export const MarketRegistry = ({ user }: { user: UserProfile }) => {
  const [markets] = useState<Market[]>(MOCK_MARKETS);
  const [search, setSearch] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const [filterType, setFilterType] = useState('ALL');
  const [filterOwnership, setFilterOwnership] = useState('ALL');
  const [yearRange, setYearRange] = useState({ start: '1800', end: '2025' });
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [groundingMarket, setGroundingMarket] = useState<Market | null>(null);
  const [groundingData, setGroundingData] = useState<{ text: string; links: any[] } | null>(null);
  const [loadingGrounding, setLoadingGrounding] = useState(false);

  const handleSort = (key: 'name' | 'capacity' | 'date') => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const filtered = useMemo(() => {
    let result = markets.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                           m.city.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'ALL' || m.type === filterType;
      const matchesOwnership = filterOwnership === 'ALL' || m.ownership === filterOwnership;
      const establishedYear = new Date(m.establishedDate).getFullYear();
      const matchesDate = establishedYear >= Number(yearRange.start) && establishedYear <= Number(yearRange.end);
      return matchesSearch && matchesType && matchesOwnership && matchesDate;
    });

    result.sort((a, b) => {
      let valA: any = sortBy === 'name' ? a.name.toLowerCase() : sortBy === 'capacity' ? a.capacity : new Date(a.establishedDate).getTime();
      let valB: any = sortBy === 'name' ? b.name.toLowerCase() : sortBy === 'capacity' ? b.capacity : new Date(b.establishedDate).getTime();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [markets, search, filterType, filterOwnership, yearRange, sortBy, sortDirection]);

  const analyticsData = useMemo(() => {
    const capacityData = markets.map(m => ({ name: m.name, capacity: m.capacity, established: new Date(m.establishedDate).getFullYear() })).sort((a, b) => a.established - b.established);
    const ownershipCounts: Record<string, number> = { PUBLIC: 0, PRIVATE: 0, PPP: 0 };
    markets.forEach(m => { if (ownershipCounts[m.ownership] !== undefined) ownershipCounts[m.ownership]++; });
    const ownershipData = Object.entries(ownershipCounts).map(([name, value]) => ({ name, value }));
    return { capacityData, ownershipData };
  }, [markets]);

  const OWNERSHIP_COLORS = { PUBLIC: '#3b82f6', PRIVATE: '#818cf8', PPP: '#ec4899' };

  const handleFetchGrounding = async (market: Market) => {
    setGroundingMarket(market);
    setLoadingGrounding(true);
    const data = await bff.getSpatialGrounding(market.name, market.city);
    setGroundingData(data || { text: "Manual hub verification required.", links: [] });
    setLoadingGrounding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="text-indigo-600" size={32} /> Hub Registry
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Regional infrastructure and spatial trade nodes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAnalytics(!showAnalytics)} className="font-bold text-xs h-12 px-6 shadow-sm border-2">
            {showAnalytics ? <LayoutGrid size={18}/> : <PieIcon size={18}/>}
            {showAnalytics ? 'Grid View' : 'Ownership BI'}
          </Button>
          {(user.role === 'SUPER_ADMIN' || user.role === 'MARKET_ADMIN') && (
            <Button className="font-black uppercase tracking-widest text-xs h-12 px-8 bg-indigo-600 border-none text-white shadow-xl shadow-indigo-100 dark:shadow-none">
              <Plus size={18}/> New Node
            </Button>
          )}
        </div>
      </div>

      {!showAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(market => (
            <Card key={market.id} className="relative group overflow-hidden border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all shadow-xl rounded-[32px] p-8 bg-white dark:bg-slate-900">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{market.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mt-1">
                      <MapPin size={12} className="text-indigo-500" /> {market.city}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${market.ownership === 'PUBLIC' ? 'bg-blue-50 text-blue-600' : market.ownership === 'PRIVATE' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                  {market.ownership}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Trade Capacity</p>
                    <p className="text-sm font-black dark:text-white">{market.capacity.toLocaleString()} Units</p>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Est. Cycle</p>
                    <p className="text-sm font-black dark:text-white">{new Date(market.establishedDate).getFullYear()}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="secondary" onClick={() => handleFetchGrounding(market)} className="flex-1 h-12 text-[10px] font-black uppercase border-slate-200 dark:border-slate-700">
                   <Navigation size={14}/> Directions Node
                 </Button>
                 <Button variant="outline" className="flex-1 h-12 text-[10px] font-black uppercase border-2">Node Assets</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
           <Card className="rounded-[40px] p-10 bg-white dark:bg-slate-900 border-none shadow-2xl">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 dark:text-white">Ownership Distribution</h3>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={analyticsData.ownershipData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value">
                          {analyticsData.ownershipData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={OWNERSHIP_COLORS[entry.name as keyof typeof OWNERSHIP_COLORS]} />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}} />
                       <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize:'10px', fontWeight:'900', textTransform:'uppercase'}}/>
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </Card>
           <Card className="rounded-[40px] p-10 bg-white dark:bg-slate-900 border-none shadow-2xl">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 dark:text-white">Capacity Load Indices</h3>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.capacityData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" hide />
                       <YAxis fontSize={10} tick={{fill:'#64748b'}} axisLine={false} />
                       <Tooltip cursor={{fill:'transparent'}} />
                       <Bar dataKey="capacity" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>
        </div>
      )}

      {groundingMarket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[48px] p-0 relative bg-white dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <button onClick={() => setGroundingMarket(null)} className="absolute top-8 right-8 text-slate-400 p-2"><X size={32}/></button>
              <div className="p-12 overflow-y-auto custom-scrollbar">
                  <div className="flex gap-6 items-center mb-10">
                      <div className="w-20 h-20 bg-slate-900 dark:bg-indigo-600 text-white rounded-[32px] flex items-center justify-center text-3xl font-black shadow-2xl"><MapIcon size={32} /></div>
                      <div>
                          <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">{groundingMarket.name}</h3>
                          <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center gap-1 mt-2 w-fit"><Sparkles size={10}/> Spatial Intelligence</span>
                      </div>
                  </div>
                  <div className="space-y-8">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                          {loadingGrounding ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-4">
                               <RefreshCw className="animate-spin" size={32}/>
                               <p className="text-xs font-bold animate-pulse uppercase tracking-widest">Triangulating Hub Node...</p>
                            </div>
                          ) : (
                            <>
                               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic mb-6">"{groundingData?.text}"</p>
                               <div className="grid grid-cols-1 gap-3">
                                  {groundingData?.links.map((link, idx) => (
                                    <button 
                                      key={idx} 
                                      onClick={() => window.open(link.uri, '_blank')}
                                      className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-600 transition-all group"
                                    >
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Navigation size={24}/></div>
                                          <span className="font-black text-xs uppercase tracking-widest dark:text-white">{link.title}</span>
                                       </div>
                                       <ExternalLink size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    </button>
                                  ))}
                               </div>
                            </>
                          )}
                      </div>
                  </div>
                  <Button className="w-full h-16 mt-8 uppercase font-black tracking-widest text-xs shadow-2xl bg-slate-900 dark:bg-indigo-600 text-white border-none rounded-2xl" onClick={() => setGroundingMarket(null)}>Close Intelligence View</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};