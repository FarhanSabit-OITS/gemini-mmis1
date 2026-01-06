
import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Filter, Plus, Edit, Trash2, AlertCircle, ShoppingBag, 
  Send, CheckCircle, X, Save, Info, User, Tag, DollarSign, Boxes, 
  Warehouse, ShieldCheck, ChevronDown, ArrowRight, Eye, LayoutGrid, Zap,
  TrendingUp, BarChart3, ListFilter, ClipboardCheck, Star, Sparkles,
  ArrowDownLeft, ArrowUpRight, History, Settings
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

  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'General'
  });

  const [showRestockModal, setShowRestockModal] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

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
      setItems([{ id: 'PRD-'+Math.random().toString(36).substr(2,4).toUpperCase(), vendor: user.name, ...form, price: Number(form.price), stock: newStock, status }, ...items]);
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
              <p className="text-slate-50 font-medium text-lg bg-black px-3 py-1 rounded-xl">Terminal: ALPHA-SYNC</p>
           </div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" onClick={() => setShowRestockModal(true)} className="h-14 px-8 font-black uppercase text-xs tracking-widest border-2">
             <ArrowUpRight size={18}/> Product Request
           </Button>
           <Button onClick={() => { setEditingProduct(null); setShowFormModal(true); }} className="shadow-2xl shadow-indigo-200 h-14 px-8 font-black uppercase tracking-widest text-xs">
              <Plus size={20} /> Register SKU
           </Button>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('REGISTRY')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'REGISTRY' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}>Central Ledger</button>
        <button onClick={() => setActiveTab('CMS')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CMS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}>Shop CMS</button>
        <button onClick={() => setActiveTab('LOGS')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'LOGS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}>Stock Log</button>
      </div>

      {activeTab === 'REGISTRY' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                 <Input icon={Search} placeholder="Search by SKU, Name, or Node..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
              </div>
              <select className="bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 shadow-xl">
                 <option>Filter Category: All</option>
                 <option>Produce & Grain</option>
                 <option>Electronics</option>
              </select>
              <Button variant="secondary" className="h-12 font-black uppercase text-[10px] tracking-widest border-2">Export Ledger</Button>
           </div>

           <Card className="p-0 overflow-hidden rounded-[32px] shadow-2xl border-none">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-8 py-5">Commodity SKU</th>
                          <th className="px-8 py-5">Node Health</th>
                          <th className="px-8 py-5 text-center">Featured</th>
                          <th className="px-8 py-5 text-right">Valuation</th>
                          <th className="px-8 py-5 text-right">Ops</th>
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
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col gap-1.5">
                                   <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                      <span className={item.status === 'HEALTHY' ? 'text-emerald-600' : 'text-red-500'}>{item.status}</span>
                                      <span className="text-slate-400">{item.stock} Units</span>
                                   </div>
                                   <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full transition-all duration-1000 ${item.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${Math.min(item.stock/2, 100)}%`}}></div>
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
                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={18}/></button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      )}

      {activeTab === 'CMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
           <Card className="rounded-[48px] p-10 shadow-2xl border-none">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Sparkles className="text-indigo-600" /> Featured CMS Showcase</h3>
                 <p className="text-[10px] font-black uppercase text-slate-400">Front-end Node Simulation</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                 {items.filter(i => i.isFeatured).map(item => (
                   <div key={item.id} className="bg-slate-900 text-white p-8 rounded-[40px] relative overflow-hidden group">
                      <div className="relative z-10">
                         <div className="flex justify-between items-start mb-6">
                            <span className="bg-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-white/10 tracking-[0.2em]">Live on Marketplace</span>
                            <Star fill="currentColor" size={20} className="text-amber-400" />
                         </div>
                         <h4 className="text-3xl font-black tracking-tighter mb-2">{item.name}</h4>
                         <p className="text-indigo-300 text-sm font-medium opacity-80 mb-8">{item.description}</p>
                         <div className="flex items-center justify-between">
                            <p className="text-2xl font-black tracking-tighter text-emerald-400">UGX {item.price.toLocaleString()}</p>
                            <Button variant="secondary" className="!bg-white/10 !text-white border-none h-12 text-xs font-black uppercase px-6">Edit Landing</Button>
                         </div>
                      </div>
                      <Package size={200} className="absolute -right-10 -bottom-10 opacity-5 text-white" />
                   </div>
                 ))}
                 {items.filter(i => i.isFeatured).length === 0 && (
                   <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[40px]">
                      <Star size={48} className="mx-auto mb-4 text-slate-200" />
                      <p className="font-black uppercase text-xs text-slate-300">No Featured SKUs in CMS Hub.</p>
                   </div>
                 )}
              </div>
           </Card>

           <Card className="rounded-[48px] p-10 shadow-2xl border-none flex flex-col">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8">Category Performance</h3>
              <div className="flex-1 min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={[{name:'Produce', value:60}, {name:'Electronics', value:15}, {name:'Clothing', value:25}]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                          <Cell fill="#4f46e5" />
                          <Cell fill="#8b5cf6" />
                          <Cell fill="#10b981" />
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                    <span>Total SKU Value</span>
                    <span className="text-slate-900">UGX 14.5M</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                    <span>Average Lifecycle</span>
                    <span className="text-slate-900">18.4 Days</span>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {showRestockModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <Card className="w-full max-w-xl rounded-[48px] p-12 bg-white relative overflow-hidden shadow-2xl border-none">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Product Requisition</h3>
                 <button onClick={() => setShowRestockModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={32}/></button>
              </div>
              <div className="space-y-6">
                 <Input label="Target Commodity SKU / Name *" placeholder="e.g. Basmati Rice" icon={Package} />
                 <div className="grid grid-cols-2 gap-6">
                    <Input label="Desired Quantity *" type="number" placeholder="0" icon={Boxes} />
                    <Input label="Max Unit Price (UGX) *" type="number" placeholder="0.00" icon={DollarSign} />
                 </div>
                 <Input label="Technical Context" multiline placeholder="Specific grade, region, or moisture requirements..." />
                 <Button className="w-full h-16 bg-indigo-600 border-none shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs rounded-2xl">Broadcast RFQ to Network</Button>
              </div>
           </Card>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <Card className="w-full max-w-xl rounded-[48px] p-12 bg-white relative overflow-hidden shadow-2xl border-none">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{editingProduct ? 'Update SKU' : 'Initialize SKU'}</h3>
                 <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={32}/></button>
              </div>
              <div className="space-y-6">
                 <Input label="Official Designation *" value={form.name} onChange={(e:any)=>setForm({...form, name:e.target.value})} />
                 <div className="grid grid-cols-2 gap-6">
                    <Input label="Base Price (UGX) *" type="number" value={form.price} onChange={(e:any)=>setForm({...form, price:e.target.value})} />
                    <Input label="Current Reserve *" type="number" value={form.stock} onChange={(e:any)=>setForm({...form, stock:e.target.value})} />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Classification Segment</label>
                    <select value={form.category} onChange={(e:any)=>setForm({...form, category:e.target.value})} className="bg-black text-white p-4 rounded-2xl font-black uppercase text-xs outline-none border-2 border-slate-800 shadow-xl appearance-none">
                       <option>Food & Produce</option>
                       <option>Electronics</option>
                       <option>General Retail</option>
                    </select>
                 </div>
                 <Input label="Product Description" multiline value={form.description} onChange={(e:any)=>setForm({...form, description:e.target.value})} />
                 <Button onClick={handleSave} className="w-full h-16 bg-indigo-600 border-none shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs rounded-2xl">Commit to Global Ledger</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};
