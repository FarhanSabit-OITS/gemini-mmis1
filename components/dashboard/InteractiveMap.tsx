import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Building2, Info, ExternalLink, Globe, Layers, Map as MapIcon, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Market, UserProfile } from '../../types';
import { MOCK_MARKETS } from '../../constants';

interface InteractiveMapProps {
  user: UserProfile;
  initialMarketId?: string;
}

export const InteractiveMap = ({ user, initialMarketId }: InteractiveMapProps) => {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(
    initialMarketId ? MOCK_MARKETS.find(m => m.id === initialMarketId) || MOCK_MARKETS[0] : MOCK_MARKETS[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mapDetails, setMapDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketGrounding = async (marketName: string) => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find the exact address, location details, and nearby landmarks for ${marketName} in Uganda.`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const mapLink = grounding?.find((c: any) => c.maps?.uri)?.maps?.uri;
      
      setMapDetails({
        description: response.text || "No descriptive location data returned.",
        uri: mapLink || `https://www.google.com/maps/search/${encodeURIComponent(marketName + ' Uganda')}`,
      });
    } catch (err: any) {
      console.error("Grounding error:", err);
      setError("Registry sync failed. Displaying fallback coordinate data.");
      setMapDetails({
        description: `Location data for ${marketName} is currently being synced from regional registries. Please consult hub management for precise stalling data.`,
        uri: `https://www.google.com/maps/search/${encodeURIComponent(marketName + ' Uganda')}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMarket) {
      fetchMarketGrounding(selectedMarket.name);
    }
  }, [selectedMarket]);

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <MapIcon className="text-indigo-600" size={28} />
            Regional Commerce Mapping
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Interactive spatial overview of {user.role === 'SUPER_ADMIN' ? 'all regional' : 'assigned'} markets.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs font-black uppercase tracking-widest"><Layers size={16}/> Toggle Layers</Button>
          <Button className="text-xs font-black uppercase tracking-widest"><Compass size={16}/> My Location</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-2xl flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
            <AlertCircle size={18}/> {error}
          </div>
          <button onClick={() => selectedMarket && fetchMarketGrounding(selectedMarket.name)} className="text-[10px] font-black uppercase text-red-600 hover:underline flex items-center gap-1">
            <RefreshCw size={12}/> Re-Sync Hub
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Sidebar: Market List */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar pr-2">
          <Input 
            icon={Search} 
            placeholder="Search markets..." 
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
          
          <div className="space-y-3">
            {MOCK_MARKETS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(market => (
              <button
                key={market.id}
                onClick={() => setSelectedMarket(market)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedMarket?.id === market.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedMarket?.id === market.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Building2 size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{market.name}</p>
                    <p className={`text-[10px] uppercase tracking-widest font-black opacity-70`}>{market.city}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Map View */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <Card className="flex-1 p-0 overflow-hidden relative border-2 border-slate-100 dark:border-slate-800 shadow-xl group">
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              {loading ? (
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-bold text-slate-400 animate-pulse">Triangulating via Google Maps Grounding...</p>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full animate-ping absolute -inset-0 opacity-20"></div>
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
                        <MapPin size={20} />
                      </div>
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-2xl">
                        {selectedMarket?.name}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-xl">+</button>
                    <button className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-xl">-</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl border-none p-4 flex items-center justify-between animate-slide-up">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <Navigation size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Intelligence</p>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">Verified Location in {selectedMarket?.city}</h4>
                    </div>
                 </div>
                 <Button 
                   onClick={() => window.open(mapDetails?.uri, '_blank')}
                   className="text-[10px] font-black uppercase tracking-widest"
                 >
                   Get Directions <ExternalLink size={14} className="ml-1"/>
                 </Button>
              </Card>
            </div>
          </Card>

          {/* Bottom Info Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            <Card className="flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">
                  <Globe size={14}/> Spatial Intelligence
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  {loading ? 'Gathering latest news and details about this location...' : mapDetails?.description}
                </p>
              </div>
            </Card>
            <Card className="flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trading Capacity</p>
                   <p className="text-lg font-black text-slate-800 dark:text-white">{selectedMarket?.capacity.toLocaleString()} Units</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                   <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">Operational</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-2">
                 <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Traffic</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Moderate</p>
                 </div>
                 <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Accessibility</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">High</p>
                 </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};