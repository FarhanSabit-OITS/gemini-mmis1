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
  ChevronLeft, ChevronRight, Zap, Star
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

  const handleKYCEscalate = (vendor: Vendor, status: 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'PENDING') => {
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, kycStatus: status } : v));
  };

  const handleRateVendor = () => {
    if (!ratingTarget) return;
    setVendors(prev => prev.map(v => {
      if (v.id === ratingTarget.id) {
        const count = (v.ratingCount || 0) + 1;
        const currentRating = v.rating || 0;
        const newRating = ((currentRating * (count - 1)) + ratingValue) / count;
        return { ...v, rating: Number(newRating.toFixed(1)), ratingCount: count };
      }
      return v;
    }));
    setShowRatingModal(false);
    setRatingTarget(null);
    setRatingComment('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map((file: any) => URL.createObjectURL(file));
      setProductForm(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
    }
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

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
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
                 <button onClick={() => setBulkAction('ACTIVATE')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-colors"><CheckCircle2 size={14}/> Activate</button>
                 <button onClick={() => setBulkAction('DEACTIVATE')} className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-colors"><Ban size={14}/> Deactivate</button>
               </div>
             </div>
           )}

           <Card className="p-0 overflow-hidden rounded-[32px] shadow-2xl border-none bg-white dark:bg-slate-900">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-center">
                 <div className="w-full xl:w-96">
                    <Input icon={Search} className="mb-0" placeholder="Search by Name, Category, ID..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
                 </div>
                 <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none flex-1 xl:flex-none">
                      <option value="ALL">All Categories</option>
                      {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none flex-1 xl:flex-none">
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
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
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('name')}>Entity Identity <ArrowUpDown size={12} className="inline ml-1"/></th>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('rating')}>Trust Index <ArrowUpDown size={12} className="inline ml-1"/></th>
                      <th className="px-6 py-4">Classification</th>
                      <th className="px-6 py-4">Spatial Node</th>
                      <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('dues')}>Outstanding Dues <ArrowUpDown size={12} className="inline ml-1"/></th>
                      <th className="px-6 py-4 text-center">KYC Registry</th>
                      <th className="px-6 py-4 text-right">Quick Response</th>
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
                           <button 
                             onClick={() => { setRatingTarget(vendor); setShowRatingModal(true); }}
                             className="flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded-lg transition-all"
                           >
                              <Star size={16} className="text-amber-500 fill-amber-500" />
                              <span className="text-xs font-black text-slate-900 dark:text-white">{vendor.rating || 0}</span>
                              <span className="text-[9px] text-slate-400">({vendor.ratingCount || 0})</span>
                           </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            {vendor.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{vendor.market}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{vendor.city}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {vendor.rentDue + vendor.vatDue > 0 ? (
                            <div className="font-black text-xs text-red-600 dark:text-red-400">
                               UGX {(vendor.rentDue + vendor.vatDue).toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-emerald-600 font-black text-xs flex items-center justify-end gap-1"><CheckCircle2 size={12}/> Settled</div>
                          )}
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
                            {vendor.kycStatus === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleKYCEscalate(vendor, 'APPROVED')}
                                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-emerald-700 transition-colors"
                                >
                                  Authorize
                                </button>
                                <button 
                                  onClick={() => handleKYCEscalate(vendor, 'REJECTED')}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {vendor.kycStatus === 'REJECTED' && (
                               <button 
                                 onClick={() => handleKYCEscalate(vendor, 'PENDING')}
                                 className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-indigo-700 transition-colors"
                               >
                                 Restore
                               </button>
                            )}
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

      {/* Product SKU Modal */}
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
                     <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1 mb-3 block">SKU Visualization Registry</label>
                     <div className="grid grid-cols-4 gap-4">
                        {productForm.images?.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group bg-slate-50 dark:bg-slate-950">
                              <img src={img} alt="Product" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => moveImage(idx, -1)} className="p-1 text-white hover:text-indigo-400 transition-colors"><ChevronLeft size={16}/></button>
                                <button onClick={() => removeImage(idx)} className="p-1 text-white hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                <button onClick={() => moveImage(idx, 1)} className="p-1 text-white hover:text-indigo-400 transition-colors"><ChevronRight size={16}/></button>
                              </div>
                           </div>
                        ))}
                        <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors bg-slate-50 dark:bg-slate-950/50">
                           <ImageIcon size={24}/>
                           <span className="text-[8px] font-black uppercase mt-2">Add Assets</span>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                     </div>
                  </div>
               </div>

               <div className="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  <Button variant="secondary" onClick={() => setShowProductModal(false)} className="flex-1 h-14 font-black uppercase text-xs">Cancel</Button>
                  <Button onClick={handleProductSave} className="flex-[2] h-14 bg-indigo-600 border-none font-black uppercase text-xs text-white shadow-xl">Commit SKU Sync</Button>
               </div>
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