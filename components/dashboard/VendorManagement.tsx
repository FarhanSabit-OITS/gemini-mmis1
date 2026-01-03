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
//import { GoogleGenAI } from '@google/genai';
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

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<Vendor | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  
  // Product Management State
  const [myProducts, setMyProducts] = useState<Product[]>([
    { id: 'P-101', name: 'Wireless Headphones', price: 150000, stock: 45, category: 'Electronics', status: 'HEALTHY', vendor: 'Global Tech', description: 'Noise cancelling high fidelity.', images: [] },
    { id: 'P-102', name: 'Smart Watch Series 5', price: 350000, stock: 12, category: 'Electronics', status: 'LOW', vendor: 'Global Tech', description: 'Water resistant, heart rate monitor.', images: [] }
  ]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({ name: '', price: 0, stock: 0, category: 'General', description: '', images: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters & Sorting
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDuesOnly, setShowDuesOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'city' | 'status' | 'dues' | 'rating'; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const availableCategories = useMemo(() => {
    const cats = new Set(vendors.map(v => v.category));
    return Array.from(cats).sort();
  }, [vendors]);

  const handleSort = (key: 'name' | 'city' | 'status' | 'dues' | 'rating') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredVendors = useMemo(() => {
    // Enhancement: Tokenized search splitting input into multiple terms for effective matching
    const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

    let result = vendors.filter(v => {
      // Logic: Ensure every term in the search query matches at least one primary field
      const matchSearch = searchTerms.every(term => 
        v.name.toLowerCase().includes(term) || 
        v.email.toLowerCase().includes(term) ||
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
      
      if (sortConfig.key === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortConfig.key === 'city') {
        valA = a.city.toLowerCase();
        valB = b.city.toLowerCase();
      } else if (sortConfig.key === 'status') {
        valA = a.status;
        valB = b.status;
      } else if (sortConfig.key === 'dues') {
        valA = a.rentDue + a.vatDue;
        valB = b.rentDue + b.vatDue;
      } else if (sortConfig.key === 'rating') {
        valA = a.rating || 0;
        valB = b.rating || 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vendors, search, categoryFilter, statusFilter, showDuesOnly, sortConfig]);

  const executeBulkAction = () => {
    if (!bulkAction) return;
    const newStatus = bulkAction === 'ACTIVATE' ? 'ACTIVE' : 'INACTIVE';
    setVendors(prev => prev.map(v => 
      selectedVendorIds.has(v.id) ? { ...v, status: newStatus } : v
    ));
    setSelectedVendorIds(new Set());
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const handleKYCEscalate = (vendor: Vendor, status: 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'PENDING') => {
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, kycStatus: status } : v));
  };

  const handleSelectAll = () => {
    if (selectedVendorIds.size === filteredVendors.length) {
      setSelectedVendorIds(new Set());
    } else {
      setSelectedVendorIds(new Set(filteredVendors.map(v => v.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedVendorIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedVendorIds(newSet);
  };

  const fetchLocationGrounding = async (vendor: Vendor) => {
    setLoadingMap(true);
    setMapGrounding(null);
    // try {
    //   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    //   const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash',
    //     contents: `Provide exact physical location details and nearby landmarks for ${vendor.market} in ${vendor.city}, Uganda. This is for vendor: ${vendor.name}.`,
    //     config: {
    //       tools: [{ googleMaps: {} }],
    //     },
    //   });

    //   const text = response.text || "No descriptive location data available.";
    //   const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    //   const links = chunks
    //     .filter((c: any) => c.maps)
    //     .map((c: any) => ({
    //       title: c.maps.title || "View on Google Maps",
    //       uri: c.maps.uri
    //     }));

    //   setMapGrounding({ text, links });
    // } catch (e) {
    //   console.error("Grounding failed", e);
    //   setMapGrounding({
    //     text: "Could not retrieve real-time spatial data. Showing estimated coordinates.",
    //     links: [{ title: "Search on Maps", uri: `https://www.google.com/maps/search/${encodeURIComponent(vendor.market + ' ' + vendor.city)}` }]
    //   });
    // } finally {
    //   setLoadingMap(false);
    // }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      {/* Tab Controls */}
      <div className="flex flex-wrap gap-2 glass p-2 rounded-2xl w-fit border-slate-200 dark:border-slate-700/50 shadow-inner">
        {isAdmin && <button onClick={() => setActiveTab('DIRECTORY')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>Registry</button>}
        {isVendor && <button onClick={() => setActiveTab('FINANCIALS')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FINANCIALS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>Settlement Node</button>}
        {isVendor && <button onClick={() => setActiveTab('MY_PRODUCTS')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MY_PRODUCTS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>My Products</button>}
        {isVendor && <button onClick={() => setActiveTab('KYC')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'KYC' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>KYC Vault</button>}
      </div>

      {activeTab === 'DIRECTORY' && isAdmin && (
        <div className="space-y-4">
           {selectedVendorIds.size > 0 && (
             <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-slide-down">
               <div className="flex items-center gap-3">
                 <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black">{selectedVendorIds.size} Selected</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => { setBulkAction('ACTIVATE'); setShowBulkConfirm(true); }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-colors"><CheckCircle2 size={14}/> Activate</button>
                 <button onClick={() => { setBulkAction('DEACTIVATE'); setShowBulkConfirm(true); }} className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-colors"><Ban size={14}/> Deactivate</button>
               </div>
             </div>
           )}

           <Card className="p-0 overflow-hidden rounded-[32px] shadow-2xl border-none bg-white dark:bg-slate-900">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-center">
                 <div className="w-full xl:w-80">
                    {/* UI Enhancement: Updated placeholder to guide category-based searches */}
                    <Input icon={Search} className="mb-0" placeholder="Search name, ID, category or hub..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
                 </div>
                 <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                    <div className="relative flex-1 xl:flex-none">
                       <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16}/>
                       <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-indigo-500 shadow-sm transition-all min-w-[160px]">
                        <option value="ALL">All Categories</option>
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                    </div>

                    <div className="relative flex-1 xl:flex-none">
                       <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16}/>
                       <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-indigo-500 shadow-sm transition-all min-w-[180px]">
                        <option value="ALL">All Hub Statuses</option>
                        <option value="ACTIVE">Active Node</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="UNDER_REVIEW">Under Audit</option>
                        <option value="INACTIVE">Inactive / Revoked</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                    </div>

                    <button 
                      onClick={() => setShowDuesOnly(!showDuesOnly)}
                      className={`h-[46px] px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all shadow-sm ${
                        showDuesOnly 
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-800' 
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
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('name')}>Entity Identity <ArrowUpDown size={12} className="inline ml-1"/></th>
                      <th className="px-6 py-4">Classification</th>
                      <th className="px-6 py-4">Current Status</th>
                      <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('dues')}>Outstanding Dues <ArrowUpDown size={12} className="inline ml-1"/></th>
                      <th className="px-6 py-4 text-center">KYC Audit</th>
                      <th className="px-6 py-4 text-right">Operations</th>
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
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-sm">
                              {vendor.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{vendor.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{vendor.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            {vendor.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border flex items-center justify-center gap-1.5 w-fit ${
                            vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            vendor.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            vendor.status === 'UNDER_REVIEW' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                            'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {vendor.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`px-3 py-1.5 rounded-xl inline-block transition-colors ${
                            vendor.rentDue + vendor.vatDue > 0 
                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 shadow-sm' 
                            : 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20'
                          }`}>
                            {vendor.rentDue + vendor.vatDue > 0 ? (
                              <div className="font-black text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
                                 UGX {(vendor.rentDue + vendor.vatDue).toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-emerald-600 dark:text-emerald-500 font-black text-xs flex items-center justify-end gap-1"><CheckCircle2 size={12}/> Settled</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border flex items-center justify-center gap-1.5 mx-auto w-24 ${
                            vendor.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            vendor.kycStatus === 'PENDING' || vendor.kycStatus === 'SUBMITTED' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            vendor.kycStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {vendor.kycStatus === 'APPROVED' && <CheckCircle2 size={10}/>}
                            {(vendor.kycStatus === 'PENDING' || vendor.kycStatus === 'SUBMITTED') && <Clock size={10}/>}
                            {vendor.kycStatus === 'REJECTED' && <XCircle size={10}/>}
                            {vendor.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="text-slate-400 hover:text-indigo-600 p-2 transition-colors rounded-lg hover:bg-indigo-50"><MoreHorizontal size={18} /></button>
                          </div>
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
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Confirm Bulk Action</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                    You are about to <strong className={bulkAction === 'ACTIVATE' ? 'text-emerald-600' : 'text-red-600'}>{bulkAction?.toLowerCase()}</strong> {selectedVendorIds.size} vendor node{selectedVendorIds.size > 1 ? 's' : ''}. This will affect their trade status across the regional hub.
                 </p>
                 <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setShowBulkConfirm(false)} className="flex-1 h-14 font-black uppercase text-xs">Abort Operation</Button>
                    <Button 
                      onClick={executeBulkAction} 
                      className={`flex-1 h-14 border-none text-white font-black uppercase text-xs shadow-xl ${
                        bulkAction === 'ACTIVATE' ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    >
                      Authorize Hub Sync
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {/* Vendor Detail Side Panel */}
      {viewingVendor && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-end animate-slide-left">
          <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto p-8 border-l border-slate-100 dark:border-slate-800 relative">
            <button onClick={() => setViewingVendor(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>

            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                  {viewingVendor.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{viewingVendor.name}</h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{viewingVendor.id} • {viewingVendor.market}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{viewingVendor.category}</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{viewingVendor.products} SKUs</span>
              </div>
            </div>

            <div className="space-y-8">
              <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[32px] bg-slate-50 dark:bg-slate-800/50">
                <div className="relative h-56 bg-slate-200 dark:bg-slate-700 flex items-center justify-center group overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative">
                        <div className="w-12 h-12 bg-red-500 rounded-full opacity-20 animate-ping absolute inset-0"></div>
                        <MapPin size={48} className="text-red-500 drop-shadow-xl relative z-10" />
                     </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl flex justify-between items-center shadow-lg border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md">
                           <Navigation size={16}/>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Location</p>
                           <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{viewingVendor.market}, {viewingVendor.city}</p>
                        </div>
                     </div>
                     {mapGrounding?.links?.[0] && (
                        <Button 
                           onClick={() => window.open(mapGrounding.links[0].uri, '_blank')} 
                           className="h-8 text-[9px] px-4 bg-indigo-600 border-none text-white uppercase font-black tracking-widest shadow-md hover:bg-indigo-700"
                        >
                           Get Directions
                        </Button>
                     )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <Globe size={16} className="text-indigo-600"/> Spatial Intelligence
                    </h4>
                  </div>
                  {loadingMap ? (
                     <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                        <RefreshCw size={16} className="animate-spin"/>
                        <span className="text-xs font-bold">Triangulating vendor node...</span>
                     </div>
                  ) : (
                     <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                        "{mapGrounding ? mapGrounding.text : "Location data unavailable."}"
                     </p>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className={`p-6 border-none shadow-lg rounded-[24px] ${
                  viewingVendor.rentDue + viewingVendor.vatDue > 0 
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100' 
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                }`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${viewingVendor.rentDue + viewingVendor.vatDue > 0 ? 'text-red-500' : 'text-slate-400'}`}>Fiscal Liability</p>
                  <p className={`text-xl font-black tracking-tighter ${viewingVendor.rentDue + viewingVendor.vatDue > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                    UGX {(viewingVendor.rentDue + viewingVendor.vatDue).toLocaleString()}
                  </p>
                </Card>
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[24px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Join Date</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{viewingVendor.joinedDate}</p>
                </Card>
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