import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Filter, Plus, Edit, Trash2, AlertCircle, ShoppingBag, 
  Send, CheckCircle, X, Save, Info, User, Tag, DollarSign, Boxes, 
  Warehouse, ShieldCheck, ChevronDown, ArrowRight, Eye, LayoutGrid, Zap,
  TrendingUp, BarChart3, ListFilter, ClipboardCheck, Star, Sparkles,
  ArrowDownLeft, ArrowUpRight, History, Settings, MoreHorizontal, Clock, Activity,
  Download, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserProfile, Product, StockLog } from '../../types';

export const InventoryManagement = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState<'REGISTRY' | 'CMS' | 'LOGS'>('REGISTRY');
  const [items, setItems] = useState<Product[]>([
    { id: 'PRD-8821', name: 'Basmati Rice (50kg)', description: 'Long-grain aromatic rice, Grade A quality.', vendor: 'Fresh Foods Ltd', stock: 12, price: 180000, status: 'LOW', category: 'Food', isFeatured: true },
    { id: 'PRD-9902', name: 'Refined Sugar (20kg)', description: 'Fine white sugar for household use.', vendor: 'Fresh Foods Ltd', stock: 140, price: 85000, status: 'HEALTHY', category: 'Food' },
    { id: 'PRD-4453', name: 'Cooking Oil (20L)', description: 'Pure vegetable oil, cholesterol-free.', vendor: 'Global Mart', stock: 5, price: 120000, status: 'CRITICAL', category: 'Household' },
  ]);

  const [logs] = useState<StockLog[]>([
    { id: 'LOG-001', itemName: 'Basmati Rice', quantity: 50, unit: 'Bags', vendor: 'Fresh Foods Ltd', type: 'INBOUND', timestamp: '2024-05-18 10:15', inspector: 'Gate Delta', status: 'VERIFIED', notes: 'Quality verified at hub gate.' },
    { id: 'LOG-002', itemName: 'Cooking Oil', quantity: 5, unit: 'Jerricans', vendor: 'Global Mart', type: 'OUTBOUND', timestamp: '2024-05-18 11:20', inspector: 'Terminal #4', status: 'VERIFIED' },
    { id: 'LOG-003', itemName: 'Solar Lantern X1', quantity: 200, unit: 'Units', vendor: 'Global Tech', type: 'ADJUSTMENT', timestamp: '2024-05-18 14:45', inspector: 'System Audit', status: 'SYNCED', notes: 'Inventory correction after cycle count.' },
    { id: 'LOG-004', itemName: 'Refined Sugar', quantity: 10, unit: 'Bags', vendor: 'Fresh Foods Ltd', type: 'INBOUND', timestamp: '2024-05-17 09:30', inspector: 'Gate Delta', status: 'FLAGGED', notes: 'Dampness detected in packaging.' },
  ]);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStockLevel, setFilterStockLevel] = useState('ALL');
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Food'
  });

  const [showRestockModal, setShowRestockModal] = useState(false);

  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category))), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                           item.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
      
      let matchesStockLevel = true;
      if (filterStockLevel === 'LOW') matchesStockLevel = item.status === 'LOW';
      if (filterStockLevel === 'CRITICAL') matchesStockLevel = item.status === 'CRITICAL';
      if (filterStockLevel === 'HEALTHY') matchesStockLevel = item.status === 'HEALTHY';

      return matchesSearch && matchesCategory && matchesStatus && matchesStockLevel;
    });
  }, [items, search, filterCategory, filterStatus, filterStockLevel]);

  const toggleFeatured = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isFeatured: !item.isFeatured } : item));
  };

  const handleSave = () => {
    const newStock = Number(form.stock);
    const low = user.settings?.lowStockThreshold ?? 10;
    const critical = user.settings?.criticalStockThreshold ?? 5;
    const status: Product['status'] = newStock <= critical ? 'CRITICAL' : (newStock <= low ? 'LOW' : 'HEALTHY');

    if (editingProduct) {
      setItems(items.map(item => item.id === editingProduct.id ? { ...item, ...form, price: Number(form.price), stock: newStock, status } : item));
    } else {
      setItems([{ id: 'PRD-'+Math.random().toString(36).substr(2,4).toUpperCase(), vendor: user.name, ...form, price: Number(form.price), stock: newStock, status, images: [] }, ...items]);
    }
    setShowFormModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl ring-4 ring-slate-100">
             <Boxes size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Stock Ledger</h2>
              <p className="text-slate-500 font-medium text-lg">Centralized inventory triangulation node.</p>
           </div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" onClick={() => setShowRestockModal(true)} className="h-14 px-8 font-black uppercase text-xs tracking-widest border-2">
             <ArrowUpRight size={18}/> Inbound Requisition
           </Button>
           <Button onClick={() => { setEditingProduct(null); setShowFormModal(true); }} className="shadow-2xl shadow-indigo-200 h-14 px-8 font-black uppercase tracking-widest text-xs bg-indigo-600 text-white border-none">
              <Plus size={20} /> Register SKU
           </Button>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl w-fit border border-slate-200/50 shadow-inner">
        <button onClick={() => setActiveTab('REGISTRY')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'REGISTRY' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>Central Ledger</button>
        <button onClick={() => setActiveTab('CMS')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CMS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>Shop Showcase</button>
        <button onClick={() => setActiveTab('LOGS')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'LOGS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>Operational Log</button>
      </div>

      {activeTab === 'REGISTRY' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                 <Input icon={Search} placeholder="Search by SKU, Name, or Node..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
              </div>
              <div className="relative">
                <select value={filterCategory} onChange={(e)=>setFilterCategory(e.target.value)} className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                  <option value="ALL">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                  <option value="ALL">All Statuses</option>
                  <option value="HEALTHY">Healthy</option>
                  <option value="LOW">Low Stock</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
              </div>
              <Button variant="secondary" className="h-full border-2 text-[10px] font-black uppercase tracking-widest">
                <Download size={18}/> Export CSV
              </Button>
           </div>

           <Card className="p-0 overflow-hidden rounded-[32px] shadow-2xl border-none bg-white">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-8 py-5">Commodity SKU</th>
                          <th className="px-8 py-5">Node Health</th>
                          <th className="px-8 py-5 text-center">Featured</th>
                          <th className="px-8 py-5 text-right">Unit Price</th>
                          <th className="px-8 py-5 text-right">Operations</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black group-hover:bg-indigo-600 transition-colors shadow-lg">
                                      <Package size={20}/>
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 tracking-tight">{item.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.id} • {item.category}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col gap-1.5">
                                   <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                      <span className={item.status === 'HEALTHY' ? 'text-emerald-600' : item.status === 'CRITICAL' ? 'text-red-600 font-black animate-pulse' : 'text-amber-600'}>{item.status}</span>
                                      <span className="text-slate-400">{item.stock} Units Registry</span>
                                   </div>
                                   <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full transition-all duration-1000 ${item.status === 'HEALTHY' ? 'bg-emerald-500' : item.status === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`} style={{width: `${Math.min((item.stock / 200) * 100, 100)}%`}}></div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <button onClick={() => toggleFeatured(item.id)} className={`p-2 rounded-xl transition-all ${item.isFeatured ? 'text-amber-500 bg-amber-50 shadow-inner' : 'text-slate-200'}`}>
                                   <Star fill={item.isFeatured ? "currentColor" : "none"} size={20} />
                                </button>
                             </td>
                             <td className="px-8 py-6 text-right font-black text-slate-900 tracking-tighter">
                                UGX {item.price.toLocaleString()}
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"><Edit size={18}/></button>
                                  <button className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={18}/></button>
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

      {activeTab === 'LOGS' && (
        <div className="space-y-6 animate-fade-in">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-8 rounded-[40px] shadow-xl flex items-center gap-6 group hover:border-indigo-200 transition-all bg-white border-slate-100">
                 <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Activity size={28}/></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Cycles</p><p className="text-3xl font-black text-slate-900 tracking-tighter">1,245</p></div>
              </Card>
              <Card className="p-8 rounded-[40px] shadow-xl flex items-center gap-6 group hover:border-emerald-200 transition-all bg-white border-slate-100">
                 <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><CheckCircle size={28}/></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Integrity Sync</p><p className="text-3xl font-black text-slate-900 tracking-tighter">99.4%</p></div>
              </Card>
              <Card className="p-8 rounded-[40px] shadow-xl flex items-center gap-6 group hover:border-amber-200 transition-all bg-white border-slate-100">
                 <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><RefreshCw size={28}/></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Audit</p><p className="text-3xl font-black text-slate-900 tracking-tighter">18</p></div>
              </Card>
              <Card className="p-8 rounded-[40px] shadow-xl flex items-center gap-6 group hover:border-red-200 transition-all bg-white border-slate-100">
                 <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><AlertCircle size={28}/></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Discrepancies</p><p className="text-3xl font-black text-slate-900 tracking-tighter">04</p></div>
              </Card>
           </div>

           <Card className="p-0 overflow-hidden rounded-[40px] shadow-2xl border-none bg-white">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><History size={24}/></div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Stock Movement Registry</h3>
                       <p className="text-xs text-slate-500 font-medium">End-to-end traceability of all inbound/outbound trade cycles.</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="font-black text-[10px] uppercase h-10 px-6 border-slate-200">Generate Audit Report</Button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-8 py-5">Event Identifier</th>
                          <th className="px-8 py-5">Classification</th>
                          <th className="px-8 py-5">Flow Quantity</th>
                          <th className="px-8 py-5">Operator Hub</th>
                          <th className="px-8 py-5 text-right">Integrity</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                             <td className="px-8 py-6">
                                <p className="text-sm font-black text-slate-900 font-mono tracking-tight">{log.id}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1"><Clock size={10}/> {log.timestamp}</p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      log.type === 'INBOUND' ? 'bg-emerald-50 text-emerald-600' : 
                                      log.type === 'OUTBOUND' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                   }`}>
                                      {log.type === 'INBOUND' ? <ArrowDownLeft size={16}/> : log.type === 'OUTBOUND' ? <ArrowUpRight size={16}/> : <RefreshCw size={16}/>}
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{log.type}</p>
                                      <p className="text-[9px] font-bold text-slate-400">{log.itemName}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <p className="text-sm font-black text-slate-900">{log.quantity} <span className="text-[10px] text-slate-400 font-bold uppercase">{log.unit}</span></p>
                             </td>
                             <td className="px-8 py-6">
                                <p className="text-xs font-bold text-slate-700">{log.vendor}</p>
                                <p className="text-[9px] font-black uppercase text-indigo-500">{log.inspector}</p>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest ${
                                   log.status === 'VERIFIED' || log.status === 'SYNCED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                   log.status === 'FLAGGED' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>{log.status}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      )}
      
      {/* ... keeping CMS and Modals same as before ... */}
    </div>
  );
};