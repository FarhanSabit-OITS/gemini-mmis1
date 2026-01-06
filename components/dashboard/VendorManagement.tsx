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
  ChevronLeft, ChevronRight, Zap, Star, ListFilter, Tag,
  ChevronDown, AlertCircle, UserCheck
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
    { id: 'V-001', name: 'Global Tech Solution', email: 'sales@globaltech.ug', category: 'Electronics', status: 'ACTIVE', kycStatus: 'APPROVED', products: 145, joinedDate: '2023-11-12', gender: 'MALE', age: 34, city: 'Kampala', market: 'Owino Market', rentDue: 0, vatDue: 0, rating: 4.8, ratingCount: 12 },
    { id: 'V-002', name: 'Fresh Foods Co.', email: 'orders@freshfoods.ug', category: 'Groceries', status: 'PENDING_APPROVAL', kycStatus: 'PENDING', products: 45, joinedDate: '2024-01-20', gender: 'FEMALE', age: 29, city: 'Jinja', market: 'Jinja Main', rentDue: 150000, vatDue: 25000, rating: 4.2, ratingCount: 8 },
    { id: 'V-003', name: 'Mukasa General Trade', email: 'mukasa@trade.ug', category: 'General', status: 'INACTIVE', kycStatus: 'REJECTED', products: 12, joinedDate: '2024-03-05', gender: 'MALE', age: 45, city: 'Mbarara', market: 'Mbarara Central', rentDue: 300000, vatDue: 50000, rating: 3.5, ratingCount: 4 },
    { id: 'V-004', name: 'City Shoppers', email: 'shop@city.ug', category: 'Clothing', status: 'UNDER_REVIEW', kycStatus: 'APPROVED', products: 89, joinedDate: '2023-08-15', gender: 'FEMALE', age: 27, city: 'Kampala', market: 'Nakasero Market', rentDue: 0, vatDue: 0, rating: 4.9, ratingCount: 22 },
  ]);
  
  // Bulk Action State
  const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<'ACTIVATE' | 'DEACTIVATE' | null>(null);
  
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [mapGrounding, setMapGrounding] = useState<{ text: string; links: any[] } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDuesOnly, setShowDuesOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'city' | 'status' | 'dues'; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const availableCategories = useMemo(() => {
    const cats = new Set(vendors.map(v => v.category));
    return Array.from(cats).sort();
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    // Enhancement: Multi-term tokenized search
    const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

    let result = vendors.filter(v => {
      // Cross-field tokenized match
      const matchSearch = searchTerms.length === 0 || searchTerms.every(term => 
        v.name.toLowerCase().includes(term) || 
        v.id.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term) ||
        v.market.toLowerCase().includes(term) ||
        v.city.toLowerCase().includes(term)
      );

      const matchCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchDues = !showDuesOnly || (v.rentDue + v.vatDue > 0);

      return matchSearch && matchCategory && matchStatus && matchDues;
    });

    result.sort((a, b) => {
      let valA: any, valB: any;
      if (sortConfig.key === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
      else if (sortConfig.key === 'city') { valA = a.city.toLowerCase(); valB = b.city.toLowerCase(); }
      else if (sortConfig.key === 'status') { valA = a.status; valB = b.status; }
      else if (sortConfig.key === 'dues') { valA = a.rentDue + a.vatDue; valB = b.rentDue + b.vatDue; }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vendors, search, categoryFilter, statusFilter, showDuesOnly, sortConfig]);

  const handleSelectAll = () => {
    if (selectedVendorIds.size === filteredVendors.length) {
      setSelectedVendorIds(new Set());
    } else {
      setSelectedVendorIds(new Set(filteredVendors.map(v => v.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedVendorIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedVendorIds(newSet);
  };

  const executeBulkAction = () => {
    if (!bulkAction) return;
    const newStatus = bulkAction === 'ACTIVATE' ? 'ACTIVE' : 'INACTIVE';
    setVendors(prev => prev.map(v => 
      selectedVendorIds.has(v.id) ? { ...v, status: newStatus as any } : v
    ));
    setSelectedVendorIds(new Set());
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const fetchLocationGrounding = async (vendor: Vendor) => {
    setLoadingMap(true);
    setMapGrounding(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Physical location landmarks for ${vendor.market} in ${vendor.city}, Uganda.`,
        config: { tools: [{ googleMaps: {} }] },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setMapGrounding({ 
        text: response.text || "Location details synced.", 
        links: chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }))
      });
    } catch (e) {
      setMapGrounding({ text: "Manual hub verification required.", links: [] });
    } finally {
      setLoadingMap(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      {/* Tab Controls */}
      <div className="flex flex-wrap gap-2 glass p-2 rounded-2xl w-fit border-slate-200 dark:border-slate-700 shadow-inner">
        {isAdmin && <button onClick={() => setActiveTab('DIRECTORY')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>Registry</button>}
        {isVendor && <button onClick={() => setActiveTab('FINANCIALS')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FINANCIALS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>Settlement Node</button>}
      </div>

      {activeTab === 'DIRECTORY' && isAdmin && (
        <div className="space-y-4">
           {/* Bulk Action Bar */}
           {selectedVendorIds.size > 0 && (
             <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-slide-up ring-4 ring-indigo-500/20">
                <div className="flex items-center gap-4">
                   <CheckSquare size={20} />
                   <span className="text-xs font-black uppercase tracking-widest">{selectedVendorIds.size} Registry Nodes Selected</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setBulkAction('ACTIVATE'); setShowBulkConfirm(true); }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all"><CheckCircle2 size={14}/> Activate</button>
                   <button onClick={() => { setBulkAction('DEACTIVATE'); setShowBulkConfirm(true); }} className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all"><Ban size={14}/> Deactivate</button>
                </div>
             </div>
           )}

           <Card className="p-0 overflow-hidden rounded-[32px] shadow-2xl border-none bg-white dark:bg-slate-900">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-center">
                 <div className="w-full xl:w-96">
                    <Input icon={Search} className="mb-0" placeholder="Search name, ID, category or hub..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
                 </div>
                 <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <div className="relative">
                       <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16}/>
                       <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-indigo-500 shadow-sm min-w-[160px]">
                        <option value="ALL">All Categories</option>
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                    </div>

                    <div className="relative">
                       <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16}/>
                       <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-indigo-500 shadow-sm min-w-[160px]">
                        <option value="ALL">All Hub Status</option>
                        <option value="ACTIVE">Active Node</option>
                        <option value="PENDING_APPROVAL">Pending</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                    </div>

                    <button 
                      onClick={() => setShowDuesOnly(!showDuesOnly)}
                      className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all shadow-sm ${
                        showDuesOnly 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800' 
                        : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <Banknote size={16}/> {showDuesOnly ? <span>Dues {'>'} 0</span> : 'Dues: Any'}
                    </button>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 w-12 text-center">
                        <button onClick={handleSelectAll} className="text-slate-400 hover:text-indigo-600">
                          {selectedVendorIds.size === filteredVendors.length && filteredVendors.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </th>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => setSortConfig({key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>Entity <ArrowUpDown size={10} className="inline ml-1"/></th>
                      <th className="px-6 py-4">Classification</th>
                      <th className="px-6 py-4">Node Status</th>
                      <th className="px-6 py-4 text-right" onClick={() => setSortConfig({key: 'dues', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>Dues <ArrowUpDown size={10} className="inline ml-1"/></th>
                      <th className="px-6 py-4 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredVendors.map(vendor => (
                      <tr key={vendor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleSelectOne(vendor.id)} className={`${selectedVendorIds.has(vendor.id) ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}>
                            {selectedVendorIds.has(vendor.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => { setViewingVendor(vendor); fetchLocationGrounding(vendor); }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black group-hover:bg-indigo-600 transition-colors">{vendor.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{vendor.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{vendor.id} • {vendor.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{vendor.category}</span></td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border flex items-center justify-center gap-1.5 w-fit ${
                            vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            vendor.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {vendor.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-xs">
                          {vendor.rentDue + vendor.vatDue > 0 ? (
                            <span className="text-red-600">UGX {(vendor.rentDue + vendor.vatDue).toLocaleString()}</span>
                          ) : (
                            <span className="text-emerald-600 flex items-center justify-end gap-1"><CheckCircle2 size={12}/> Settled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-indigo-600 p-2"><MoreHorizontal size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </Card>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] flex items-center justify-center p-4">
           <Card className="w-full max-w-md rounded-[40px] p-10 bg-white dark:bg-slate-900 border-none shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${bulkAction === 'ACTIVATE' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <div className="text-center">
                 <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl ${
                    bulkAction === 'ACTIVATE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                 }`}>
                    {bulkAction === 'ACTIVATE' ? <UserCheck size={40}/> : <Ban size={40}/>}
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Confirm Bulk Hub Sync</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                    You are about to <strong className={bulkAction === 'ACTIVATE' ? 'text-emerald-600' : 'text-red-600'}>{bulkAction?.toLowerCase()}</strong> {selectedVendorIds.size} vendor node{selectedVendorIds.size > 1 ? 's' : ''}. This will affect their trading status across the regional hub instantly.
                 </p>
                 <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setShowBulkConfirm(false)} className="flex-1 h-14 font-black uppercase text-xs">Abort Operation</Button>
                    <Button 
                      onClick={executeBulkAction} 
                      className={`flex-1 h-14 border-none text-white font-black uppercase text-xs shadow-xl ${
                        bulkAction === 'ACTIVATE' ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    >
                      Authorize Sync
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {/* Vendor Detail Sidebar */}
      {viewingVendor && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-end animate-slide-left">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto p-10 border-l border-slate-100 dark:border-slate-800 relative">
            <button onClick={() => setViewingVendor(null)} className="absolute top-8 right-8 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>

            <div className="flex items-center gap-5 mb-10">
               <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100 dark:shadow-none">
                  {viewingVendor.name.charAt(0)}
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{viewingVendor.name}</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{viewingVendor.id} • {viewingVendor.city} Center</p>
               </div>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                       <MapPin size={16}/> Spatial Intelligence
                    </div>
                 </div>
                 {loadingMap ? (
                    <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                       <RefreshCw size={16} className="animate-spin"/>
                       <span className="text-xs font-bold">Triangulating vendor node...</span>
                    </div>
                 ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                       "{mapGrounding?.text || "Hub details synchronized with regional mapping nodes."}"
                    </p>
                 )}
                 {mapGrounding?.links.map((link:any, idx:number) => (
                    <a key={idx} href={link.uri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase hover:underline">
                       {link.title} <ExternalLink size={14}/>
                    </a>
                 ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Stock Load</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{viewingVendor.products} SKUs</p>
                 </Card>
                 <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fiscal Status</p>
                    <p className={`text-xl font-black ${viewingVendor.rentDue + viewingVendor.vatDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                       {viewingVendor.rentDue + viewingVendor.vatDue > 0 ? `UGX ${(viewingVendor.rentDue+viewingVendor.vatDue).toLocaleString()}` : 'Settled'}
                    </p>
                 </Card>
              </div>
              
              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex gap-4">
                 <Button className="flex-1 h-14 bg-indigo-600 border-none font-black uppercase text-xs rounded-2xl">Broadcast Bulletin</Button>
                 <Button variant="secondary" className="flex-1 h-14 border-slate-200 dark:border-slate-700 font-black uppercase text-xs rounded-2xl">Audit Logs</Button>
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