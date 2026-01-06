import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, Filter, Calendar, Tag, ChevronDown, 
  ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, 
  Package, Truck, MoreVertical, Eye, Printer, Download, ListFilter,
  DollarSign, MapPin, Navigation, ExternalLink, X, RefreshCw, Layers
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Order, UserProfile } from '../../types';

export const OrdersManagement = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING'>('INCOMING');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const [orders] = useState<Order[]>([
    { id: 'ORD-1001', customerName: 'Alice Johnson', vendorName: user.name, items: [{ id: '1', productId: 'P1', name: 'Maize Flour', quantity: 5, price: 12000 }], total: 60000, status: 'PENDING', createdAt: '2024-05-18 09:30', type: 'INCOMING', tags: ['Retail', 'Priority'] },
    { id: 'ORD-1002', customerName: 'John Doe', vendorName: user.name, items: [{ id: '2', productId: 'P2', name: 'Cooking Oil', quantity: 2, price: 45000 }], total: 90000, status: 'DISPATCHED', createdAt: '2024-05-17 14:20', type: 'INCOMING', tags: ['Bulk'] },
    { id: 'ORD-1003', customerName: user.name, vendorName: 'Nile Agro', items: [{ id: '3', productId: 'P3', name: 'Fertilizer', quantity: 10, price: 150000 }], total: 1500000, status: 'DELIVERED', createdAt: '2024-05-15 11:00', type: 'OUTGOING' },
  ]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = order.type === activeTab;
      const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) || order.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [orders, activeTab, search, statusFilter]);

  const statusColors = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
    DISPATCHED: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400',
    CANCELLED: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400',
  };

  const getStatusStage = (status: string) => {
    if (status === 'PENDING') return 1;
    if (status === 'DISPATCHED') return 3;
    if (status === 'DELIVERED') return 4;
    return 0;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-indigo-50 dark:ring-indigo-950/20"><ShoppingBag size={32} /></div>
           <div><h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Order Hub</h2><p className="text-slate-500 dark:text-slate-400 font-medium">Infrastructure fulfillment ledger.</p></div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="h-12 border-2 dark:border-slate-800 dark:bg-slate-900"><Download size={18}/> XLS</Button>
          <Button className="h-12 px-8 font-black uppercase text-xs shadow-xl shadow-indigo-100 dark:shadow-none"><Printer size={18}/> Print Log</Button>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-800/30 p-2 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-700/50">
        <button onClick={() => setActiveTab('INCOMING')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'INCOMING' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Incoming</button>
        <button onClick={() => setActiveTab('OUTGOING')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OUTGOING' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Outgoing</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Input icon={Search} placeholder="Search ID or Customer..." value={search} onChange={(e:any) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase outline-none focus:border-indigo-600 appearance-none shadow-xl">
            <option value="ALL">All States</option>
            <option value="PENDING">Pending</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <Card key={order.id} className="p-6 rounded-[32px] border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all group bg-white dark:bg-slate-900">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${order.type === 'INCOMING' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'}`}><Package size={28}/></div>
                <div>
                   <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-mono">{order.id}</h4>
                   <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${statusColors[order.status as keyof typeof statusColors]}`}>{order.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Settlement</p><p className="text-lg font-black text-indigo-600 dark:text-indigo-400">UGX {order.total.toLocaleString()}</p></div>
                <Button onClick={() => setTrackingOrder(order)} variant="secondary" className="h-12 px-6 rounded-xl font-black uppercase text-[10px] border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900">Track Node</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {trackingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[48px] p-0 relative bg-white dark:bg-slate-900 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <button onClick={() => setTrackingOrder(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 z-10"><X size={32}/></button>
              <div className="p-12">
                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Fulfillment Integrity</p>
                 <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white font-mono mb-12">{trackingOrder.id}</h3>
                 <div className="relative mb-16 px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 transition-all duration-1000 rounded-full" style={{ width: `${(getStatusStage(trackingOrder.status) / 4) * 100}%` }}></div>
                    <div className="relative flex justify-between">
                       {[
                         { id: 1, label: 'Placed', icon: ShoppingBag },
                         { id: 2, label: 'Audit', icon: CheckCircle2 },
                         { id: 3, label: 'Transit', icon: Truck },
                         { id: 4, label: 'Ready', icon: MapPin }
                       ].map((step) => (
                           <div key={step.id} className="flex flex-col items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 border-2 ${getStatusStage(trackingOrder.status) >= step.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-300 border-slate-100 dark:border-slate-700'}`}><step.icon size={20} /></div>
                              <span className={`text-[8px] font-black uppercase ${getStatusStage(trackingOrder.status) >= step.id ? 'text-indigo-600' : 'text-slate-400'}`}>{step.label}</span>
                           </div>
                       ))}
                    </div>
                 </div>
                 <Button onClick={() => setTrackingOrder(null)} className="w-full h-16 bg-slate-900 dark:bg-indigo-600 text-white border-none shadow-2xl font-black uppercase text-xs rounded-3xl">Dismiss Terminal</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};