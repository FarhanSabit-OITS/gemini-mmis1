import React, { useState, useMemo } from 'react';
import { 
  Building2, MapPin, Plus, Search, Filter, Calendar, 
  Users, Briefcase, Globe, ExternalLink, ShieldAlert, 
  TrendingUp, BarChart as ChartIcon, LayoutGrid, ChevronDown, ArrowUpDown,
  Navigation, Info, Sparkles, X, Map as MapIcon, RefreshCw, PieChart as PieIcon,
  Landmark
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
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

  // Grounding state
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
      let valA: any, valB: any;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'capacity') {
        valA = a.capacity;
        valB = b.capacity;
      } else if (sortBy === 'date') {
        valA = new Date(a.establishedDate).getTime();
        valB = new Date(b.establishedDate).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [markets, search, filterType, filterOwnership, yearRange, sortBy, sortDirection]);

  // Analytics Data
  const capacityData = useMemo(() => {
    return markets.map(m => ({
      name: m.name,
      capacity: m.capacity,
      established: new Date(m.establishedDate).getFullYear()
    })).sort((a, b) => a.established - b.established);
  }, [markets]);

  const typeDistributionData = useMemo(() => {
    const counts: Record<string, number> = { WHOLESALE: 0, RETAIL: 0, MIXED: 0 };
    markets.forEach(m => {
      if (counts[m.type] !== undefined) counts[m.type]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [markets]);

  const ownershipDistributionData = useMemo(() => {
    const counts: Record<string, number> = { PUBLIC: 0, PRIVATE: 0, PPP: 0 };
    markets.forEach(m => {
      if (counts[m.ownership] !== undefined) counts[m.ownership]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [markets]);

  const TYPE_COLORS = {
    WHOLESALE: '#4f46e5',
    RETAIL: '#10b981',
    MIXED: '#f59e0b'
  };

  const OWNERSHIP_COLORS = {
    PUBLIC: '#3b82f6', // Blue
    PRIVATE: '#8b5cf6', // Violet
    PPP: '#ec4899' // Pink
  };

  const handleFetchGrounding = async (market: Market) => {
    setGroundingMarket(market);
    setLoadingGrounding(true);
    setGroundingData(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide exact physical location details, directions, and nearby trade landmarks for ${market.name} in ${market.city}, Uganda. Explain how a vendor can reach there from the city center.`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || "No descriptive data available.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps.title || "Open in Google Maps",
          uri: c.maps.uri
        }));

      setGroundingData({ text, links });
    } catch (e) {
      setGroundingData({ 
        text: "System could not establish a real-time grounding link. Please verify via local regional offices.", 
        links: [{ title: "Fallback Search", uri: `https://www.google.com/maps/search/${encodeURIComponent(market.name + ' ' + market.city)}` }] 
      });
    } finally {
      setLoadingGrounding(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-indigo-600" size={32} />
            Hub Registry
          </h2>
          <p className="text-slate-500 font-medium">Regional commerce nodes organized by infrastructure and ownership.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="font-bold text-xs flex items-center gap-2 h-12 px-6 shadow-sm border-2"
          >
            {showAnalytics ? <LayoutGrid size={18}/> : <ChartIcon size={18}/>}
            {showAnalytics ? 'Show Hub Grid' : 'Visual BI Analytics'}
          </Button>
          {(user.role === 'SUPER_ADMIN' || user.role === 'MARKET_ADMIN') && (
            <Button className="font-black uppercase tracking-widest text-xs h-12 px-8 shadow-xl shadow-indigo-100 bg-indigo-600 border-none text-white">
              <Plus size={18}/> Register Center
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <Input icon={Search} placeholder="Filter markets by name, city..." value={search} onChange={(e:any) => setSearch(e.target.value)} />
          </div>
          <div className="md:col-span-2 relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer shadow-lg"
            >
              <option value="ALL">All Types</option>
              <option value="WHOLESALE">Wholesale Hub</option>
              <option value="RETAIL">Retail Market</option>
              <option value="MIXED">Mixed Use</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
          <div className="md:col-span-2 relative">
            <select 
              value={filterOwnership}
              onChange={(e) => setFilterOwnership(e.target.value)}
              className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer shadow-lg"
            >
              <option value="ALL">All Ownership</option>
              <option value="PUBLIC">Public Domain</option>
              <option value="PRIVATE">Private Sector</option>
              <option value="PPP">PPP Model</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 gap-2">
            <div className="relative">
               <label className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase z-10">From Year</label>
               <input type="number" value={yearRange.start} onChange={(e)=>setYearRange({...yearRange, start: e.target.value})} className="w-full h-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-600 transition-all"/>
            </div>
            <div className="relative">
               <label className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase z-10">To Year</label>
               <input type="number" value={yearRange.end} onChange={(e)=>setYearRange({...yearRange, end: e.target.value})} className="w-full h-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-600 transition-all"/>
            </div>
          </div>
        </div>
        
        {!showAnalytics && (
          <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Sort Manifest By:</span>
             <div className="flex gap-2">
                {[
                  { k: 'name', l: 'Hub Name' },
                  { k: 'capacity', l: 'Cap Load' },
                  { k: 'date', l: 'Est. Date' }
                ].map(s => (
                  <button 
                    key={s.k} 
                    onClick={() => handleSort(s.k as any)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${sortBy === s.k ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {s.l} {sortBy === s.k && (sortDirection === 'asc' ? <ArrowUpDown size={12} className="rotate-180"/> : <ArrowUpDown size={12}/>)}
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      {showAnalytics ? (
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="rounded-[32px] overflow-hidden shadow-2xl p-8 border-none bg-white lg:col-span-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <TrendingUp size={24} className="text-indigo-600"/> Capacity Load
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capacityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    />
                    <Bar dataKey="capacity" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-[32px] overflow-hidden shadow-2xl p-8 border-none bg-white lg:col-span-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <PieIcon size={24} className="text-indigo-600"/> Type Dist.
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name as keyof typeof TYPE_COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-[32px] overflow-hidden shadow-2xl p-8 border-none bg-white lg:col-span-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Landmark size={24} className="text-indigo-600"/> Ownership
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ownershipDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ownershipDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={OWNERSHIP_COLORS[entry.name as keyof typeof OWNERSHIP_COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Card className="rounded-[32px] p-8 border-none shadow-xl bg-white flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10 flex justify-between items-start">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trading Quadrant Count</p>
                      <p className="text-5xl font-black text-slate-900 tracking-tighter">{markets.length}</p>
                   </div>
                   <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <LayoutGrid size={28}/>
                   </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest relative z-10">
                   <TrendingUp size={16}/> Unified Network Status: Active
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
             </Card>
             
             <Card className="rounded-[32px] p-8 border-none shadow-xl bg-white lg:col-span-2 relative overflow-hidden group">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Infrastructure Hub Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={capacityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="established" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                      />
                      <Area type="monotone" dataKey="capacity" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorCap)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 opacity-50 group-hover:bg-indigo-50 transition-colors duration-700"></div>
             </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(market => (
            <Card key={market.id} className="relative group overflow-hidden border-2 border-transparent hover:border-indigo-100 transition-all shadow-xl rounded-[32px] p-8 bg-white">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:bg-indigo-600 transition-colors">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{market.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mt-1">
                      <MapPin size={12} className="text-indigo-500" /> {market.city} Node
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  market.ownership === 'PUBLIC' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  market.ownership === 'PRIVATE' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {market.ownership}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 border-y border-slate-50 py-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Briefcase size={12}/> Class
                  </p>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{market.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12}/> Established
                  </p>
                  <p className="text-sm font-black text-slate-800 tracking-tight">
                    {new Date(market.establishedDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={12}/> Capacity
                  </p>
                  <p className="text-sm font-black text-slate-800">{market.capacity.toLocaleString()} Units</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe size={12}/> Primary Trade
                  </p>
                  <p className="text-sm font-black text-slate-800 truncate">{market.primaryProducts.slice(0, 2).join(', ')}</p>
                </div>
              </div>

              <div className="flex gap-2">
                 <Button 
                   variant="secondary" 
                   className="flex-1 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border-slate-200 shadow-sm"
                   onClick={() => handleFetchGrounding(market)}
                 >
                   <Navigation size={14}/> Location Intelligence
                 </Button>
                 <Button variant="outline" className="flex-1 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border-2">
                   View Node Dossier
                 </Button>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="lg:col-span-2 py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100 shadow-inner">
               <ShieldAlert size={64} className="mx-auto mb-4 opacity-10 text-slate-400"/>
               <p className="font-black uppercase text-xs tracking-widest text-slate-400">No regional nodes triangulated in this timeframe.</p>
               <Button onClick={() => { setSearch(''); setFilterType('ALL'); setFilterOwnership('ALL'); }} variant="ghost" className="mt-4 text-indigo-600 font-bold uppercase text-[10px]">Reset Logic Constraints</Button>
            </div>
          )}
        </div>
      )}

      {/* Location Grounding Modal */}
      {groundingMarket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4 animate-fade-in">
           <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[48px] p-0 relative bg-white overflow-hidden flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <button onClick={() => setGroundingMarket(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 z-10"><X size={32}/></button>
              
              <div className="p-12 overflow-y-auto custom-scrollbar">
                  <div className="flex gap-6 items-center mb-10">
                      <div className="w-20 h-20 bg-slate-900 text-white rounded-[32px] flex items-center justify-center text-3xl font-black shadow-2xl">
                        <MapIcon size={32} />
                      </div>
                      <div>
                          <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900">{groundingMarket.name}</h3>
                          <div className="flex gap-3 mt-1">
                              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                                <Sparkles size={10}/> AI Grounded Data
                              </span>
                              <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">{groundingMarket.city} Hub</span>
                          </div>
                      </div>
                  </div>

                  <div className="space-y-8">
                      <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 relative overflow-hidden group">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">
                              <Info size={16}/> Strategic Spatial Overview
                            </div>
                            {groundingData?.links && groundingData.links.length > 0 && (
                              <Button 
                                onClick={() => window.open(groundingData.links[0].uri, '_blank')}
                                className="h-10 px-4 text-[9px] font-black uppercase bg-indigo-600 border-none text-white shadow-lg"
                              >
                                <Navigation size={12} className="mr-2"/> Get Directions
                              </Button>
                            )}
                          </div>
                          {loadingGrounding ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-4">
                               <RefreshCw className="animate-spin" size={32}/>
                               <p className="text-xs font-bold animate-pulse">Triangulating Node via Google Maps Grounding...</p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                               {groundingData?.text}
                            </p>
                          )}
                      </div>

                      <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Navigation Anchors & Directions</h4>
                          {groundingData?.links && groundingData.links.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                               {groundingData.links.map((link, idx) => (
                                 <a 
                                   key={idx} 
                                   href={link.uri} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl text-indigo-700 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                                 >
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                                          <Navigation size={20}/>
                                       </div>
                                       <span className="font-black text-sm uppercase tracking-tight">{link.title}</span>
                                    </div>
                                    <ExternalLink size={18} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                 </a>
                               ))}
                            </div>
                          ) : (
                            !loadingGrounding && (
                               <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 flex items-center gap-3 text-xs font-bold">
                                  <ShieldAlert size={18}/> Navigation nodes temporarily unreachable.
                               </div>
                            )
                          )}
                      </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-50">
                      <Button className="w-full h-14 uppercase font-black tracking-widest text-xs shadow-2xl bg-slate-900 text-white border-none rounded-2xl" onClick={() => setGroundingMarket(null)}>Close Intelligence Node</Button>
                  </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};