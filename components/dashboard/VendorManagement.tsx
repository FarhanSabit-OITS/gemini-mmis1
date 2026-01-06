import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Download, History, ArrowRight, ShieldCheck, 
  Clock, CheckCircle2, TrendingUp, RefreshCw, 
  ArrowUpRight, ArrowDownLeft, Wallet, 
  Smartphone, Key, Landmark, Receipt, X, DollarSign,
  MapPin, Building, Navigation, Globe, ExternalLink,
  Square, CheckSquare, AlertTriangle, MoreHorizontal,
  ArrowUpDown, Filter, Ban, Banknote, XCircle, Package,
  Plus, Edit, Trash2, Image as ImageIcon, Upload, LayoutGrid,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { Card } from '../ui/Card.tsx';
import { Input } from '../ui/Input.tsx';
import { Button } from '../ui/Button.tsx';
import { Vendor, UserProfile, Transaction, Product } from '../../types.ts';
import { KYCModule } from './KYCModule.tsx';

type ManagementTab = 'DIRECTORY' | 'FINANCIALS' | 'MY_PRODUCTS' | 'MY_PROFILE' | 'KYC';

const withdrawalSchema = z.object({
  amount: z.number().min(5000, "Minimum withdrawal is UGX 5,000"),
  method: z.enum(['MTN_MOMO', 'AIRTEL_MONEY', 'BANK']),
  account: z.string().min(10, "Valid account or phone number required"),
});

export const VendorManagement = ({ user }: { user: UserProfile }) => {
  const isVendor = user.role === 'VENDOR' || user.role === 'USER';
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MARKET_ADMIN';
  
  const [activeTab, setActiveTab] = useState<ManagementTab>(
    user.role === 'USER' ? 'KYC' : (isVendor ? 'FINANCIALS' : 'DIRECTORY')
  );

  const [search, setSearch] = useState('');
  const [walletBalance, setWalletBalance] = useState(1450200);
  const [vendorDues] = useState({ rent: 150000, vat: 42500 });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState<{
    amount: number;
    method: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK';
    account: string;
  }>({ amount: 0, method: 'MTN_MOMO', account: '' });
  const [withdrawErrors, setWithdrawErrors] = useState<Record<string, string>>({});
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Directory State
  const [vendors, setVendors] = useState<Vendor[]>([
    { id: 'V-001', name: 'Global Tech Solution', email: 'sales@globaltech.ug', category: 'Electronics', status: 'ACTIVE', kycStatus: 'APPROVED', products: 145, joinedDate: '2023-11-12', gender: 'MALE', age: 34, city: 'Kampala', market: 'Owino Market', rentDue: 0, vatDue: 0 },
    { id: 'V-002', name: 'Fresh Foods Co.', email: 'orders@freshfoods.ug', category: 'Groceries', status: 'PENDING_APPROVAL', kycStatus: 'PENDING', products: 45, joinedDate: '2024-01-20', gender: 'FEMALE', age: 29, city: 'Jinja', market: 'Jinja Main', rentDue: 150000, vatDue: 25000 },
    { id: 'V-003', name: 'Mukasa General Trade', email: 'mukasa@trade.ug', category: 'General', status: 'INACTIVE', kycStatus: 'REJECTED', products: 12, joinedDate: '2024-03-05', gender: 'MALE', age: 45, city: 'Mbarara', market: 'Mbarara Central', rentDue: 300000, vatDue: 50000 },
    { id: 'V-004', name: 'City Shoppers', email: 'shop@city.ug', category: 'Clothing', status: 'UNDER_REVIEW', kycStatus: 'APPROVED', products: 89, joinedDate: '2023-08-15', gender: 'FEMALE', age: 27, city: 'Kampala', market: 'Nakasero Market', rentDue: 0, vatDue: 0 },
  ]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'ACTIVATE' | 'DEACTIVATE' | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [reviewingKYC, setReviewingKYC] = useState<Vendor | null>(null);
  const [mapGrounding, setMapGrounding] = useState<{ text: string; links: any[] } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  
  // Filters & Sorting
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDuesOnly, setShowDuesOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'city' | 'status'; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TX-8801', date: '2024-05-20 09:15', amount: 450000, type: 'SALE_REVENUE', status: 'SUCCESS', method: 'MTN_MOMO', direction: 'IN' },
    { id: 'TX-8802', date: '2024-05-19 14:30', amount: 150000, type: 'RENT', status: 'SUCCESS', method: 'BANK', direction: 'OUT' },
  ]);

  const availableCategories = useMemo(() => {
    const cats = new Set(vendors.map(v => v.category));
    return Array.from(cats).sort();
  }, [vendors]);

  const fetchLocationGrounding = async (vendor: Vendor) => {
    setLoadingMap(true);
    setMapGrounding(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide exact physical location details and nearby landmarks for ${vendor.market} in ${vendor.city}, Uganda. This is for vendor: ${vendor.name}.`,
        config: { tools: [{ googleMaps: {} }] },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setMapGrounding({ 
        text: response.text || "Location details synchronized with regional hub.", 
        links: chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }))
      });
    } catch (e) {
      setMapGrounding({ text: "Spatial nodes temporarily unreachable.", links: [] });
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => { if (viewingVendor) fetchLocationGrounding(viewingVendor); }, [viewingVendor]);

  const filteredVendors = useMemo(() => {
    let result = vendors.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchDues = !showDuesOnly || (v.rentDue + v.vatDue > 0);
      return matchSearch && matchCategory && matchStatus && matchDues;
    });

    result.sort((a, b) => {
      let valA: any = a[sortConfig.key].toLowerCase();
      let valB: any = b[sortConfig.key].toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [vendors, search, categoryFilter, statusFilter, showDuesOnly, sortConfig]);

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <div className="flex flex-wrap gap-2 glass p-2 rounded-2xl w-fit shadow-inner">
        {isAdmin && <button onClick={() => setActiveTab('DIRECTORY')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Registry</button>}
        {isVendor && <button onClick={() => setActiveTab('FINANCIALS')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FINANCIALS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Settlement Node</button>}
      </div>

      {activeTab === 'DIRECTORY' && isAdmin && (
        <div className="space-y-4">
           <Card className="p-0 overflow-hidden rounded-[32px] shadow-2xl border-none">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between items-center">
                 <div className="w-full xl:w-96">
                    <Input icon={Search} className="mb-0" placeholder="Search Node ID or Entity..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
                 </div>
                 <div className="flex flex-wrap gap-3">
                    <button onClick={() => setShowDuesOnly(!showDuesOnly)} className={`h-[46px] px-4 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-2 transition-all ${showDuesOnly ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                      <Banknote size={16}/> {showDuesOnly ? <span>Dues {'>'} 0</span> : 'Dues: Any'}
                    </button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b">
                      <th className="px-6 py-4">Entity Identity</th>
                      <th className="px-6 py-4">Classification</th>
                      <th className="px-6 py-4">Node Status</th>
                      <th className="px-6 py-4 text-right">Outstanding Dues</th>
                      <th className="px-6 py-4 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredVendors.map(vendor => (
                      <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setViewingVendor(vendor)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black">{vendor.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{vendor.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{vendor.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{vendor.category}</span></td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{vendor.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {vendor.rentDue + vendor.vatDue > 0 ? (
                            <div className="font-black text-xs text-red-600">UGX {(vendor.rentDue + vendor.vatDue).toLocaleString()}</div>
                          ) : (
                            <div className="flex items-center justify-end gap-1 text-emerald-600 font-black text-xs"><CheckCircle2 size={12}/> Settled</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right"><button className="text-slate-400 p-2"><MoreHorizontal size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </Card>
        </div>
      )}

      {viewingVendor && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-end animate-slide-left">
          <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto p-8 border-l relative">
            <button onClick={() => setViewingVendor(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800"><X size={24}/></button>
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl">{viewingVendor.name.charAt(0)}</div>
                <div><h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{viewingVendor.name}</h2><p className="text-xs font-bold text-slate-500 uppercase">{viewingVendor.id}</p></div>
              </div>
            </div>
            <div className="space-y-8">
              <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[32px] bg-slate-50 dark:bg-slate-800/50">
                <div className="relative h-56 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                   <MapPin size={48} className="text-red-500 animate-bounce" />
                   <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl flex justify-between items-center shadow-lg border">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center"><Navigation size={16}/></div>
                         <div><p className="text-[10px] font-black uppercase text-slate-400">Verified Hub</p><p className="text-xs font-bold">{viewingVendor.market}, {viewingVendor.city}</p></div>
                      </div>
                   </div>
                </div>
                <div className="p-6">
                  <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 mb-4"><Globe size={16} className="text-indigo-600"/> Spatial Intelligence</h4>
                  {loadingMap ? <p className="text-xs text-slate-400 animate-pulse">Triangulating Node via Google Maps Grounding...</p> : <p className="text-xs text-slate-600 italic">"{mapGrounding?.text}"</p>}
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 rounded-[24px] shadow-lg"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fiscal Liability</p><p className="text-xl font-black">UGX {(viewingVendor.rentDue + viewingVendor.vatDue).toLocaleString()}</p></Card>
                <Card className="p-6 rounded-[24px] shadow-lg"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Join Cycle</p><p className="text-xl font-black">{viewingVendor.joinedDate}</p></Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Database = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);