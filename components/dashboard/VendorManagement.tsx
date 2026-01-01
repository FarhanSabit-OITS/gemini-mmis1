
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
  const [escalateTarget, setEscalateTarget] = useState<Vendor | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [reviewingKYC, setReviewingKYC] = useState<Vendor | null>(null);
  const [mapGrounding, setMapGrounding] = useState<{ text: string; links: any[] } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  
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
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'city' | 'status'; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TX-8801', date: '2024-05-20 09:15', amount: 450000, type: 'SALE_REVENUE', status: 'SUCCESS', method: 'MTN_MOMO', direction: 'IN' },
    { id: 'TX-8802', date: '2024-05-19 14:30', amount: 150000, type: 'RENT', status: 'SUCCESS', method: 'BANK', direction: 'OUT' },
    { id: 'TX-8803', date: '2024-05-18 11:20', amount: 25000, type: 'VAT', status: 'SUCCESS', method: 'BANK', direction: 'OUT' },
    { id: 'TX-8804', date: '2024-05-17 16:45', amount: 800000, type: 'PAYOUT', status: 'PENDING', method: 'BANK', direction: 'OUT' },
  ]);

  // Derived categories for filter
  const availableCategories = useMemo(() => {
    const cats = new Set(vendors.map(v => v.category));
    return Array.from(cats).sort();
  }, [vendors]);

  // Map Grounding Logic
  const fetchLocationGrounding = async (vendor: Vendor) => {
    setLoadingMap(true);
    setMapGrounding(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide exact physical location details and nearby landmarks for ${vendor.market} in ${vendor.city}, Uganda. This is for vendor: ${vendor.name}.`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || "No descriptive location data available.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps.title || "View on Google Maps",
          uri: c.maps.uri
        }));

      setMapGrounding({ text, links });
    } catch (e) {
      console.error("Grounding failed", e);
      setMapGrounding({
        text: "Could not retrieve real-time spatial data. Showing estimated coordinates.",
        links: [{ title: "Search on Maps", uri: `https://www.google.com/maps/search/${encodeURIComponent(vendor.market + ' ' + vendor.city)}` }]
      });
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => {
    if (viewingVendor) {
      fetchLocationGrounding(viewingVendor);
    }
  }, [viewingVendor]);

  // Bulk Actions
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

  const executeBulkAction = () => {
    if (!bulkAction) return;
    const newStatus = bulkAction === 'ACTIVATE' ? 'ACTIVE' : 'INACTIVE';
    setVendors(vendors.map(v => selectedVendorIds.has(v.id) ? { ...v, status: newStatus } : v));
    setBulkAction(null);
    setSelectedVendorIds(new Set());
  };

  const handleEscalateConfirm = () => {
    if (!escalateTarget) return;
    const newStatus = escalateTarget.status === 'PENDING' ? 'UNDER_REVIEW' : 'ACTIVE';
    setVendors(vendors.map(v => v.id === escalateTarget.id ? { ...v, status: newStatus } : v));
    setEscalateTarget(null);
  };

  const handleSort = (key: 'name' | 'city' | 'status') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredVendors = useMemo(() => {
    let result = vendors.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                          v.email.toLowerCase().includes(search.toLowerCase()) ||
                          v.id.toLowerCase().includes(search.toLowerCase()) ||
                          v.category.toLowerCase().includes(search.toLowerCase());
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
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vendors, search, categoryFilter, statusFilter, showDuesOnly, sortConfig]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawErrors({});
    
    const result = withdrawalSchema.safeParse({ 
      ...withdrawForm, 
      amount: Number(withdrawForm.amount) 
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) errMap[issue.path[0] as string] = issue.message;
      });
      setWithdrawErrors(errMap);
      return;
    }

    if (withdrawForm.amount > walletBalance) {
      setWithdrawErrors({ amount: "Withdrawal amount exceeds available node balance." });
      return;
    }

    setIsWithdrawing(true);
    await new Promise(r => setTimeout(r, 2000));
    
    const newTx: Transaction = {
      id: 'TX-WDR-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amount: Number(withdrawForm.amount),
      type: 'WITHDRAWAL',
      status: 'PENDING',
      method: withdrawForm.method,
      direction: 'OUT'
    };

    setWalletBalance(prev => prev - Number(withdrawForm.amount));
    setTransactions([newTx, ...transactions]);
    setIsWithdrawing(false);
    setShowWithdrawModal(false);
    alert("Settlement Dispatch Initialized! Funds will reflect in your destination node within 24 cycles.");
  };

  const handleProductSave = () => {
    if (editingProduct) {
      setMyProducts(myProducts.map(p => p.id === editingProduct.id ? { ...p, ...productForm } as Product : p));
    } else {
      const newProduct: Product = {
        ...productForm as Product,
        id: 'P-' + Math.floor(Math.random() * 9000),
        vendor: user.name,
        status: 'HEALTHY'
      };
      setMyProducts([newProduct, ...myProducts]);
    }
    setShowProductModal(false);
    setProductForm({ name: '', price: 0, stock: 0, category: 'General', description: '', images: [] });
    setEditingProduct(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Fixed: Explicitly typed 'file' to 'any' to resolve "Argument of type 'unknown' is not assignable to parameter of type 'Blob | MediaSource'" error
      const newImages = filesArray.map((file: any) => URL.createObjectURL(file));
      setProductForm(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const moveImage = (index: number, direction: number) => {
    if (!productForm.images) return;
    const newImages = [...productForm.images];
    if (index + direction < 0 || index + direction >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    setProductForm(prev => ({ ...prev, images: newImages }));
  };

  const deleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to remove this SKU?")) {
      setMyProducts(myProducts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-slate-100 dark:ring-slate-800">
             <Landmark size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{activeTab === 'FINANCIALS' ? 'Financial Hub' : activeTab === 'MY_PRODUCTS' ? 'Catalog Manager' : 'Vendor Registry'}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Infrastructure settlement and node liquidity terminal.</p>
           </div>
        </div>
      </div>

      {user.kycStatus === 'NONE' && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-6 rounded-2xl flex items-center justify-between shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-amber-600 dark:text-amber-400" size={32} />
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">Profile Verification Pending</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Your vendor capabilities are currently restricted. Complete your Know Your Customer (KYC) dossier to unlock full market access.</p>
            </div>
          </div>
          <Button 
            onClick={() => setActiveTab('KYC')} 
            className="h-12 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-xl shadow-amber-200 dark:shadow-none font-black uppercase text-xs tracking-widest px-8"
          >
            Initiate KYC Protocol <ArrowRight size={16} className="ml-2"/>
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 bg-slate-100/50 dark:bg-slate-800/30 p-2 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
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
                 <span className="text-xs font-medium opacity-80">Choose an action for the selected entities.</span>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setBulkAction('ACTIVATE')} 
                   className="px-4 py-2 bg-emerald-50 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                 >
                   <CheckCircle2 size={14}/> Activate
                 </button>
                 <button 
                   onClick={() => setBulkAction('DEACTIVATE')} 
                   className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                 >
                   <Ban size={14}/> Deactivate
                 </button>
               </div>
             </div>
           )}

           <Card className="p-0 overflow-hidden rounded-[32px] shadow-2xl border-none bg-white dark:bg-slate-900">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-center">
                 <div className="w-full xl:w-96">
                    <Input icon={Search} className="mb-0" placeholder="Search by Name, Category, ID..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
                 </div>
                 
                 <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-xs font-bold outline-none flex-1 xl:flex-none shadow-sm cursor-pointer hover:border-indigo-600 transition-colors"
                    >
                      <option value="ALL">All Categories</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-xs font-bold outline-none flex-1 xl:flex-none shadow-sm"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>

                    <button 
                      onClick={() => setShowDuesOnly(!showDuesOnly)}
                      className={`h-[46px] px-4 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-2 transition-all shadow-sm ${
                        showDuesOnly 
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-800' 
                        : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <Banknote size={16}/> {showDuesOnly ? <span>Dues &gt; 0</span> : 'Dues: Any'}
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
                      <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">
                          Entity Identity 
                          <ArrowUpDown 
                            size={12} 
                            className={`transition-transform ${sortConfig.key === 'name' ? 'text-indigo-600' : 'opacity-20'} ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4">Classification</th>
                      <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('city')}>
                        <div className="flex items-center gap-1">
                          Spatial Node
                          <ArrowUpDown 
                            size={12} 
                            className={`transition-transform ${sortConfig.key === 'city' ? 'text-indigo-600' : 'opacity-20'} ${sortConfig.key === 'city' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('status')}>
                        <div className="flex items-center justify-center gap-1">
                          Status
                          <ArrowUpDown 
                            size={12} 
                            className={`transition-transform ${sortConfig.key === 'status' ? 'text-indigo-600' : 'opacity-20'} ${sortConfig.key === 'status' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right">Outstanding Dues</th>
                      <th className="px-6 py-4 text-center">KYC Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
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
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setViewingVendor(vendor)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-sm">
                              {vendor.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">{vendor.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{vendor.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setViewingVendor(vendor)}>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {vendor.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setViewingVendor(vendor)}>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{vendor.market}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{vendor.city}</p>
                        </td>
                        <td className="px-6 py-4 text-center cursor-pointer" onClick={() => setViewingVendor(vendor)}>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            vendor.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            vendor.status === 'UNDER_REVIEW' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                            vendor.status === 'PENDING' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {vendor.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right cursor-pointer" onClick={() => setViewingVendor(vendor)}>
                          {vendor.rentDue + vendor.vatDue > 0 ? (
                            <>
                              <div className="font-black text-xs text-red-600">
                                 UGX {(vendor.rentDue + vendor.vatDue).toLocaleString()}
                              </div>
                              <span className="text-[8px] font-bold text-red-500 uppercase">Outstanding</span>
                            </>
                          ) : (
                            <div className="flex items-center justify-end gap-1 text-emerald-600 font-black text-xs">
                               <CheckCircle2 size={12}/> Settled
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center cursor-pointer" onClick={() => setViewingVendor(vendor)}>
                           <div className="flex justify-center">
                             <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border flex items-center justify-center gap-1.5 w-24 ${
                                vendor.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                vendor.kycStatus === 'PENDING' || vendor.kycStatus === 'SUBMITTED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                vendor.kycStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                             }`}>
                                {vendor.kycStatus === 'APPROVED' && <CheckCircle2 size={10}/>}
                                {(vendor.kycStatus === 'PENDING' || vendor.kycStatus === 'SUBMITTED') && <Clock size={10}/>}
                                {vendor.kycStatus === 'REJECTED' && <XCircle size={10}/>}
                                {vendor.kycStatus === 'NONE' && <AlertTriangle size={10}/>}
                                {vendor.kycStatus}
                             </span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {(vendor.status === 'PENDING' || vendor.status === 'PENDING_APPROVAL') && (
                              <button 
                                onClick={() => setEscalateTarget(vendor)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                              >
                                <Zap size={10}/> Escalate
                              </button>
                            )}
                            <button className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                              <MoreHorizontal size={18} />
                            </button>
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

      {/* Confirmation Modal */}
      {bulkAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-sm p-8 rounded-[32px] text-center border-none shadow-2xl relative bg-white dark:bg-slate-900">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${bulkAction === 'ACTIVATE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Confirm Bulk Action</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
              Are you sure you want to <strong>{bulkAction.toLowerCase()}</strong> {selectedVendorIds.size} selected vendors? This will update their registry status immediately.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setBulkAction(null)} className="flex-1 h-12 text-xs font-black uppercase">Cancel</Button>
              <Button 
                onClick={executeBulkAction} 
                className={`flex-1 h-12 text-xs font-black uppercase text-white border-none shadow-xl ${bulkAction === 'ACTIVATE' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-red-600 shadow-red-200'}`}
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Escalate Modal */}
      {escalateTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-sm p-8 rounded-[32px] text-center border-none shadow-2xl relative bg-white dark:bg-slate-900">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Escalate Vendor Status</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
              Promote <strong>{escalateTarget.name}</strong> to <strong>{escalateTarget.status === 'PENDING' ? 'UNDER_REVIEW' : 'ACTIVE'}</strong>? This grants advanced registry access.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setEscalateTarget(null)} className="flex-1 h-12 text-xs font-black uppercase">Cancel</Button>
              <Button 
                onClick={handleEscalateConfirm} 
                className="flex-1 h-12 text-xs font-black uppercase text-white border-none shadow-xl bg-indigo-600 shadow-indigo-200"
              >
                Authorize
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Vendor Details & Map Modal */}
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
                  {/* Decorative Map Pattern */}
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
                  
                  {/* Map Pin Pulse Effect */}
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

              {isAdmin && (
                <Button 
                  onClick={() => setReviewingKYC(viewingVendor)} 
                  className="w-full h-14 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl"
                >
                   <ShieldCheck size={16} className="mr-2"/> View KYC
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[24px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Liability</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">UGX {(viewingVendor.rentDue + viewingVendor.vatDue).toLocaleString()}</p>
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

      {/* KYC Review Modal */}
      {reviewingKYC && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[250] overflow-y-auto animate-fade-in">
           <div className="max-w-4xl mx-auto py-12 px-6">
              <div className="flex justify-between items-center mb-12">
                 <button onClick={() => setReviewingKYC(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={24}/> <span className="font-black uppercase text-xs tracking-widest">Close Review</span>
                 </button>
                 <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg">M</div>
              </div>
              <KYCModule 
                type="VENDOR" 
                userEmail={reviewingKYC.email} 
                onComplete={() => setReviewingKYC(null)}
                readOnly={true}
                initialData={{
                   businessName: reviewingKYC.name,
                   city: reviewingKYC.city,
                   market: reviewingKYC.market,
                   businessType: reviewingKYC.category
                }}
              />
           </div>
        </div>
      )}

      {/* Existing Financials & KYC components below... */}
      {activeTab === 'FINANCIALS' && (
        <div className="space-y-8 animate-fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-slate-900 text-white p-10 rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-3 bg-white/10 rounded-xl"><Wallet size={20} className="text-indigo-400"/></div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Node Balance</p>
                    </div>
                    <p className="text-5xl font-black tracking-tighter mb-8 group-hover:scale-105 transition-transform origin-left duration-500">UGX {walletBalance.toLocaleString()}</p>
                    <div className="flex gap-4">
                       <Button onClick={() => setShowWithdrawModal(true)} className="flex-1 h-14 bg-indigo-600 text-white border-none font-black uppercase text-xs rounded-2xl shadow-xl shadow-indigo-900/50 hover:bg-indigo-700 transition-all">
                          <ArrowRight size={16}/> Extract Settlement
                       </Button>
                    </div>
                 </div>
                 <Database size={300} className="absolute -right-20 -bottom-20 opacity-5 text-white pointer-events-none" />
              </Card>

              <Card className="p-10 rounded-[48px] shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between overflow-hidden relative">
                 <div>
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"><Receipt size={20} className="text-red-500"/></div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding Liabilities</p>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <span className="opacity-60">Hub Rental Node</span>
                          <span className="font-black">UGX {vendorDues.rent.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <span className="opacity-60">Regional VAT Node</span>
                          <span className="font-black">UGX {vendorDues.vat.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Liability</p>
                       <p className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tighter">UGX {(vendorDues.rent + vendorDues.vat).toLocaleString()}</p>
                    </div>
                    <Button variant="secondary" className="h-12 px-6 text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-700 dark:bg-slate-950">
                       Authorize Payment
                    </Button>
                 </div>
              </Card>

              <Card className="p-10 rounded-[48px] shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-6">
                 <div className="flex-1 bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-[32px] border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden group cursor-pointer">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Incoming Trade Volume</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">UGX 8.2M</p>
                    <div className="mt-4 flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase">
                       <TrendingUp size={14}/> +14.2% Cycle MOM
                    </div>
                    <TrendingUp size={100} className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity" />
                 </div>
                 <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-pointer">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Withdrawal Cycle</p>
                       <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">48 Hours SLA</p>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:rotate-12 transition-transform">
                       <RefreshCw size={24}/>
                    </div>
                 </div>
              </Card>
           </div>

           <Card className="rounded-[48px] p-0 overflow-hidden shadow-2xl border-none bg-white dark:bg-slate-900">
              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><History size={24}/></div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ledger history</h3>
                       <p className="text-xs text-slate-500 font-medium">Comprehensive flow of all node settlements.</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <Button variant="secondary" className="h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-950 font-black text-[10px] uppercase tracking-widest px-6"><Download size={16}/> Extract Statement</Button>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-10 py-6">Transaction Descriptor</th>
                          <th className="px-10 py-6">Classification</th>
                          <th className="px-10 py-6 text-right">Aggregate Amount</th>
                          <th className="px-10 py-6 text-center">Protocol Node</th>
                          <th className="px-10 py-6 text-right">Integrity Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                       {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                             <td className="px-10 py-8">
                                <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight font-mono">{tx.id}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{tx.date}</p>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.direction === 'IN' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-red-50 text-red-600 dark:bg-red-950/30'}`}>
                                      {tx.direction === 'IN' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                                   </div>
                                   <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{tx.type.replace('_', ' ')}</span>
                                </div>
                             </td>
                             <td className={`px-10 py-8 text-right font-black text-sm tracking-tighter ${tx.direction === 'IN' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                {tx.direction === 'IN' ? '+' : '-'} {tx.amount.toLocaleString()} UGX
                             </td>
                             <td className="px-10 py-8 text-center">
                                <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{tx.method.replace('_', ' ')}</span>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm flex items-center justify-center gap-1.5 ml-auto w-fit ${
                                   tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                   tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 
                                   'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                   {tx.status === 'SUCCESS' && <CheckCircle2 size={12}/>}
                                   {tx.status === 'PENDING' && <Clock size={12}/>}
                                   {tx.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      )}

      {activeTab === 'MY_PRODUCTS' && isVendor && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Product Catalog</h3>
              <Button onClick={() => { setEditingProduct(null); setProductForm({name:'', price:0, stock:0, category:'General', description:'', images:[]}); setShowProductModal(true); }} className="bg-indigo-600 text-white font-black uppercase text-xs px-6 h-12 shadow-xl border-none">
                 <Plus size={16}/> Add SKU
              </Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myProducts.map(product => (
                 <Card key={product.id} className="group p-0 overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900 rounded-[32px] relative">
                    <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                       {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                       ) : (
                          <Package size={48} className="text-slate-300 dark:text-slate-600" />
                       )}
                       <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingProduct(product); setProductForm(product); setShowProductModal(true); }} className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:text-indigo-600 transition-colors"><Edit size={16}/></button>
                          <button onClick={() => deleteProduct(product.id)} className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                       </div>
                    </div>
                    <div className="p-6">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                             <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{product.name}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${product.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{product.status}</span>
                       </div>
                       <div className="flex justify-between items-center mt-4">
                          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">UGX {product.price.toLocaleString()}</p>
                          <p className="text-xs font-bold text-slate-500">{product.stock} Units</p>
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
        </div>
      )}

      {showProductModal && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl rounded-[40px] p-10 bg-white dark:bg-slate-900 border-none shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
               <button onClick={() => setShowProductModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24}/></button>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">{editingProduct ? 'Edit Product SKU' : 'New Product SKU'}</h3>
               
               <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 gap-6">
                     <Input label="Product Name *" value={productForm.name} onChange={(e:any) => setProductForm({...productForm, name: e.target.value})} />
                     <Input label="Category *" value={productForm.category} onChange={(e:any) => setProductForm({...productForm, category: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <Input label="Price (UGX) *" type="number" value={productForm.price?.toString()} onChange={(e:any) => setProductForm({...productForm, price: Number(e.target.value)})} />
                     <Input label="Stock Quantity *" type="number" value={productForm.stock?.toString()} onChange={(e:any) => setProductForm({...productForm, stock: Number(e.target.value)})} />
                  </div>
                  <Input label="Description" multiline value={productForm.description} onChange={(e:any) => setProductForm({...productForm, description: e.target.value})} />
                  
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2 block">Product Imagery</label>
                     <div className="grid grid-cols-4 gap-4">
                        {productForm.images?.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                              <img src={img} alt="Product" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => moveImage(idx, -1)} className="p-1 text-white hover:text-indigo-400"><ChevronLeft size={16}/></button>
                                <button onClick={() => removeImage(idx)} className="p-1 text-white hover:text-red-500"><Trash2 size={16}/></button>
                                <button onClick={() => moveImage(idx, 1)} className="p-1 text-white hover:text-indigo-400"><ChevronRight size={16}/></button>
                              </div>
                           </div>
                        ))}
                        <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors bg-slate-50">
                           <ImageIcon size={24}/>
                           <span className="text-[8px] font-black uppercase mt-2">Add Files</span>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                     </div>
                  </div>
               </div>

               <div className="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  <Button variant="secondary" onClick={() => setShowProductModal(false)} className="flex-1 h-14 font-black uppercase text-xs">Cancel</Button>
                  <Button onClick={handleProductSave} className="flex-[2] h-14 bg-indigo-600 border-none font-black uppercase text-xs text-white shadow-xl">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
               </div>
            </Card>
         </div>
      )}

      {activeTab === 'KYC' && (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
           <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl">
                 <ShieldCheck size={40}/>
              </div>
              <div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">KYC Verification</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">Verify your trade entity to initialize market node operations.</p>
              </div>
           </div>
           
           {user.kycStatus === 'APPROVED' ? (
             <Card className="p-10 bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-[32px]">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={32}/>
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-emerald-800 dark:text-emerald-400 uppercase">Verification Complete</h4>
                      <p className="text-emerald-600 dark:text-emerald-300 font-medium">Your vendor node is fully authorized on the global ledger.</p>
                   </div>
                </div>
             </Card>
           ) : (
             <KYCModule 
               type="VENDOR" 
               userEmail={user.email} 
               onComplete={() => { alert('KYC Submitted'); setActiveTab('MY_PROFILE'); }} 
               initialData={{
                 firstName: user.name.split(' ')[0],
                 lastName: user.name.split(' ')[1] || '',
               }}
             />
           )}
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <Card className="w-full max-w-xl rounded-[48px] p-12 bg-white dark:bg-slate-900 border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Extract Settlement</h3>
                 <button onClick={() => setShowWithdrawModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={32}/></button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Withdrawal Method</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['MTN_MOMO', 'AIRTEL_MONEY', 'BANK'].map(m => (
                          <button 
                             key={m}
                             type="button"
                             onClick={() => setWithdrawForm({...withdrawForm, method: m as any})}
                             className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                withdrawForm.method === m ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                             }`}
                          >
                             {m === 'BANK' ? <Landmark size={14} className="mx-auto mb-1"/> : <Smartphone size={14} className="mx-auto mb-1"/>}
                             {m.replace('_', ' ')}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Input 
                      label="Withdrawal Amount (UGX) *" 
                      type="number" 
                      placeholder="0.00" 
                      icon={DollarSign}
                      value={withdrawForm.amount.toString()}
                      onChange={(e:any) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                    />
                    {withdrawErrors.amount && <p className="text-[10px] text-red-500 font-black uppercase px-1">{withdrawErrors.amount}</p>}

                    <Input 
                      label={withdrawForm.method === 'BANK' ? "Bank Account Number *" : "Subscriber Phone Number *"}
                      placeholder={withdrawForm.method === 'BANK' ? "8821 0021 9912" : "07xx xxxxxx"}
                      icon={withdrawForm.method === 'BANK' ? Key : Smartphone}
                      value={withdrawForm.account}
                      onChange={(e:any) => setWithdrawForm({...withdrawForm, account: e.target.value})}
                    />
                    {withdrawErrors.account && <p className="text-[10px] text-red-500 font-black uppercase px-1">{withdrawErrors.account}</p>}
                 </div>

                 <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest mb-2">
                       <span className="text-slate-400">Hub Processing Fee:</span>
                       <span className="text-slate-900 dark:text-white">UGX 1,500</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-black uppercase tracking-tighter pt-4 border-t border-slate-200 dark:border-slate-700">
                       <span className="text-slate-400">Net Extraction:</span>
                       <span className="text-indigo-600 dark:text-indigo-400">UGX {Math.max(0, Number(withdrawForm.amount) - 1500).toLocaleString()}</span>
                    </div>
                 </div>

                 <Button type="submit" loading={isWithdrawing} className="w-full h-16 bg-slate-900 dark:bg-indigo-600 text-white border-none shadow-2xl font-black uppercase tracking-widest text-xs rounded-2xl transition-all hover:scale-[1.02]">
                    Authorize Node Transfer <ArrowRight size={18} className="ml-2"/>
                 </Button>

                 <p className="text-center text-[9px] text-slate-400 uppercase font-bold tracking-tight">Settlements are protected by Platform Escrow Node 2.0</p>
              </form>
           </Card>
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
