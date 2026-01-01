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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>([
    { 
      id: 'ORD-1001', 
      customerName: 'Alice Johnson', 
      vendorName: user.name, 
      items: [{ id: '1', productId: 'P1', name: 'Maize Flour', quantity: 5, price: 12000 }],
      total: 60000, 
      status: 'PENDING', 
      createdAt: '2024-05-18 09:30', 
      type: 'INCOMING',
      tags: ['Retail', 'Priority']
    },
    { 
      id: 'ORD-1002', 
      customerName: 'John Doe', 
      vendorName: user.name, 
      items: [{ id: '2', productId: 'P2', name: 'Cooking Oil', quantity: 2, price: 45000 }],
      total: 90000, 
      status: 'DISPATCHED', 
      createdAt: '2024-05-17 14:20', 
      type: 'INCOMING',
      tags: ['Bulk']
    },
    { 
      id: 'ORD-1003', 
      customerName: user.name, 
      vendorName: 'Nile Agro', 
      items: [{ id: '3', productId: 'P3', name: 'Fertilizer', quantity: 10, price: 150000 }],
      total: 1500000, 
      status: 'DELIVERED', 
      createdAt: '2024-05-15 11:00', 
      type: 'OUTGOING' 
    },
  ]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = order.type === activeTab;
      const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) || 
                           order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                           order.vendorName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      
      const matchesDate = (dateRange.start === '' || order.createdAt >= dateRange.start) &&
                          (dateRange.end === '' || order.createdAt <= dateRange.end + ' 23:59');

      return matchesTab && matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, activeTab, search, statusFilter, dateRange]);

  const statusColors = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50',
    DISPATCHED: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50',
    DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50',
    CANCELLED: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50',
  };

  const getStatusStage = (status: string) => {
    switch(status) {
      case 'PENDING': return 1;
      case 'DISPATCHED': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-indigo-50 dark:ring-indigo-950/20">
             <ShoppingBag size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Order Management</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Infrastructure fulfillment and transaction hub.</p>
           </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="h-12 border-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><Download size={18}/> Export Ledger</Button>
          <Button className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 dark:shadow-indigo-900/10"><Printer size={18}/> Bulk Manifests</Button>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-800/30 p-2 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
        <button onClick={() => setActiveTab('INCOMING')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'INCOMING' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>Incoming Sales</button>
        <button onClick={() => setActiveTab('OUTGOING')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OUTGOING' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>Outgoing Hub</button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input icon={Search} placeholder="ID, Node, or Entity Search..." value={search} onChange={(e:any) => setSearch(e.target.value)} />
          </div>
          <div className="relative group">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-indigo-600 appearance-none cursor-pointer shadow-xl"
            >
              <option value="ALL">All States</option>
              <option value="PENDING">Pending</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
          <Button variant="secondary" onClick={() => setShowAdvanced(!showAdvanced)} className="h-full border-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ListFilter size={18}/> {showAdvanced ? 'Shrink Logic' : 'Expansion Logic'}
          </Button>
        </div>

        {showAdvanced && (
          <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-slide-down rounded-[32px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Lower Range</label>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-600 shadow-sm dark:text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Upper Range</label>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-600 shadow-sm dark:text-white" />
              </div>
              <div className="flex items-end">
                <Button variant="ghost" onClick={() => { setSearch(''); setStatusFilter('ALL'); setDateRange({start:'', end:''}); }} className="text-red-500 font-black uppercase text-[10px] tracking-[0.2em] w-full">Purge Filter Ledger</Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <Card key={order.id} className="p-6 rounded-[32px] border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all group overflow-hidden bg-white dark:bg-slate-900">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${order.type === 'INCOMING' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'}`}>
                   {order.type === 'INCOMING' ? <ArrowDownLeft size={28}/> : <ArrowUpRight size={28}/>}
                </div>
                <div>
                   <div className="flex items-center gap-3">
                     <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-mono">{order.id}</h4>
                     <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-widest shadow-sm ${statusColors[order.status as keyof typeof statusColors]}`}>
                       {order.status}
                     </span>
                   </div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-tight">
                     {order.type === 'INCOMING' ? `Origin: ${order.customerName}` : `Recipient: ${order.vendorName}`}
                   </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 lg:text-right">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center lg:justify-end gap-1.5"><Calendar size={12}/> Creation</p>
                   <p className="text-xs font-black text-slate-800 dark:text-slate-200">{order.createdAt.split(' ')[0]}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center lg:justify-end gap-1.5"><Package size={12}/> Payload</p>
                   <p className="text-xs font-black text-slate-800 dark:text-slate-200">{order.items.length} Units</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center lg:justify-end gap-1.5"><DollarSign size={12}/> Settlement</p>
                   <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">UGX {order.total.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                   <Button onClick={() => setTrackingOrder(order)} variant="secondary" className="h-12 px-6 rounded-xl font-black uppercase text-[10px] border-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"><Navigation size={16}/> Track</Button>
                   {/* Fixed title prop */}
                   <Button variant="secondary" className="h-12 w-12 p-0 rounded-xl dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400" title="Print Label"><Printer size={20}/></Button>
                   <Button variant="outline" className="h-12 border-2 rounded-xl dark:border-slate-700 dark:text-slate-400 font-black uppercase text-[10px]"><Truck size={20}/> Dispatch</Button>
                </div>
              </div>
            </div>
            {order.tags && (
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex gap-2">
                {order.tags.map(tag => (
                  <span key={tag} className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 border border-transparent dark:border-slate-700">
                    <Tag size={8}/> {tag}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
        {filteredOrders.length === 0 && (
          <div className="py-32 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
             <Clock size={64} className="mx-auto mb-4 opacity-10"/>
             <p className="font-black uppercase text-xs tracking-widest">No order manifests triangulated in this quadrant.</p>
             <p className="text-[10px] mt-2 font-medium">Verify your expansion constraints or registry search.</p>
          </div>
        )}
      </div>

      {/* Real-time Order Tracking Visualization */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4 animate-fade-in">
           <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[48px] p-0 relative bg-white dark:bg-slate-900 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <button onClick={() => setTrackingOrder(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 z-10 transition-all"><X size={32}/></button>
              
              <div className="p-12">
                 <div className="flex justify-between items-start mb-12">
                    <div>
                       <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-2">Fulfillment Integrity Node</p>
                       <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white font-mono">{trackingOrder.id}</h3>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status Protocol</p>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${statusColors[trackingOrder.status as keyof typeof statusColors]}`}>{trackingOrder.status}</span>
                    </div>
                 </div>

                 {/* Multi-Stage Progress Visualization */}
                 <div className="relative mb-16 px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1.5 bg-indigo-600 -translate-y-1/2 transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                      style={{ width: `${(getStatusStage(trackingOrder.status) / 4) * 100}%` }}
                    ></div>
                    
                    <div className="relative flex justify-between">
                       {[
                         { id: 1, label: 'Ledger Placed', icon: ShoppingBag, s: 'PENDING' },
                         { id: 2, label: 'Audit Processed', icon: CheckCircle2, s: 'PROCESSING' },
                         { id: 3, label: 'In Transit', icon: Truck, s: 'DISPATCHED' },
                         { id: 4, label: 'Node Delivered', icon: MapPin, s: 'DELIVERED' }
                       ].map((step) => {
                         const isActive = getStatusStage(trackingOrder.status) >= step.id;
                         return (
                           <div key={step.id} className="flex flex-col items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 border-2 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-950/20' : 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-700'}`}>
                                 <step.icon size={22} />
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-widest text-center max-w-[60px] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{step.label}</span>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 transition-colors">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Truck size={14}/> Logistics Manifest</p>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Layers size={18}/></div>
                             <div className="flex-1">
                                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">Regional Express UG</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Carrier Node: RX-9921</p>
                             </div>
                          </div>
                          <Button variant="secondary" className="w-full h-11 text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 shadow-sm">
                             Live Tracking Link <ExternalLink size={12} className="ml-1"/>
                          </Button>
                       </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 transition-colors">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><RefreshCw size={14}/> Cycle Intelligence</p>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                             <span>Estimated Cycle</span>
                             <span className="text-slate-800 dark:text-slate-200 font-black">48 Hours</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                             <span>Node Coordinates</span>
                             <span className="text-indigo-600 dark:text-indigo-400 font-black">Central Kampala</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                             <span>Integrity Score</span>
                             <span className="text-emerald-500 font-black">99.8% Certified</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <Button 
                   onClick={() => setTrackingOrder(null)} 
                   className="w-full h-16 bg-slate-900 dark:bg-indigo-600 text-white border-none shadow-2xl font-black uppercase text-xs rounded-[24px] transition-all hover:scale-[1.01] tracking-widest"
                 >
                   Sync Terminal & Close
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};