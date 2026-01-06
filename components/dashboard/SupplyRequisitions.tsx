
import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, Clock, ChevronRight, 
  Package, DollarSign, Truck, CheckCircle2, X, Send, 
  Info, TrendingUp, Zap, Sparkles, User, Warehouse, 
  ShieldCheck, ArrowRight, Award, MessageSquare, QrCode,
  Calendar, AlertCircle, TrendingDown, ClipboardCheck, ArrowUpRight
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Requisition, UserProfile, Bid, BridgeLogistics, ManifestItem } from '../../types';
import { PaymentGateway } from '../payments/PaymentGateway';

export const SupplyRequisitions = ({ user }: { user: UserProfile }) => {
  const isVendor = user.role === 'VENDOR';
  const isSupplier = user.role === 'SUPPLIER';
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MARKET_ADMIN';

  const [activeView, setActiveView] = useState<'REQS' | 'BRIDGE'>('REQS');
  
  const [requisitions, setRequisitions] = useState<Requisition[]>([
    { id: 'REQ-1001', vendorId: 'V-001', vendorName: 'Global Tech', itemName: 'Grade A Maize (100kg)', quantity: 25, unit: 'Bags', budget: 4500000, status: 'BIDDING', createdAt: '2024-05-18 10:00', description: 'Requires dry storage maize with moisture level below 12%. Mandatory Jinja hub delivery.', bids: [] }
  ]);

  const [bridge, setBridge] = useState<BridgeLogistics>({
    id: 'BRIDGE-W21',
    dispatchDate: 'Next Monday, 06:00 AM',
    status: 'PREPARING',
    capacity: 65,
    items: [
      { id: 'M-1', vendorId: 'V-001', vendorName: 'Global Tech', itemName: 'Industrial Salt', qty: 10, estPrice: 200000, paid: true },
      { id: 'M-2', vendorId: 'V-003', vendorName: 'Fashion Hub', itemName: 'Standard Hangers', qty: 500, estPrice: 150000, paid: true },
    ]
  });

  const [showBridgeForm, setShowBridgeForm] = useState(false);
  const [bridgePayment, setBridgePayment] = useState<ManifestItem | null>(null);
  const [activeReq, setActiveReq] = useState<Requisition | null>(null);

  const handleJoinBridge = (e: any) => {
    e.preventDefault();
    const newItem: ManifestItem = {
      id: 'M-' + Math.floor(Math.random() * 1000),
      vendorId: user.id,
      vendorName: user.name,
      itemName: e.target.item.value,
      qty: Number(e.target.qty.value),
      estPrice: Number(e.target.price.value),
      paid: false
    };
    setBridgePayment(newItem);
    setShowBridgeForm(false);
  };

  const finalizeBridgeEntry = () => {
    if (bridgePayment) {
      setBridge({
        ...bridge,
        capacity: Math.min(bridge.capacity + 5, 100),
        items: [...bridge.items, { ...bridgePayment, paid: true }]
      });
      setBridgePayment(null);
      alert("Logistics Bridge Token Generated! Your items are added to the Monday dispatch manifest.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {bridgePayment && (
        <PaymentGateway 
          amount={bridgePayment.estPrice}
          itemDescription={`Pre-payment for ${bridgePayment.itemName} (Weekly Bridge)`}
          onSuccess={finalizeBridgeEntry}
          onCancel={() => setBridgePayment(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl ring-4 ring-emerald-50">
             {activeView === 'REQS' ? <ShoppingBag size={32} /> : <Truck size={32} />}
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Supply Network</h2>
              <p className="text-slate-500 font-medium text-lg">{activeView === 'REQS' ? 'Direct Supplier Bidding & Requisitions' : 'Weekly Logistics Bridge Service'}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100/50 p-2 rounded-2xl w-fit border border-slate-200/50 shadow-inner">
        <button onClick={() => setActiveView('REQS')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'REQS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}>Direct Bidding</button>
        <button onClick={() => setActiveView('BRIDGE')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'BRIDGE' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}>Market Bridge (Weekly)</button>
      </div>

      {activeView === 'REQS' ? (
        <div className="space-y-4">
           {requisitions.map(req => (
              <Card key={req.id} onClick={() => setActiveReq(req)} className="group hover:bg-slate-50 transition-all cursor-pointer border-slate-100 shadow-xl rounded-[32px] p-8 border-l-8 border-l-transparent hover:border-l-emerald-600">
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center shrink-0"><Package className="text-emerald-600" size={28} /></div>
                    <div className="flex-1">
                       <h4 className="text-xl font-black text-slate-900 tracking-tight">{req.itemName}</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{req.vendorName} • {req.createdAt}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-slate-900 tracking-tighter">UGX {req.budget.toLocaleString()}</p>
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Bidding Active</span>
                    </div>
                 </div>
              </Card>
           ))}
           {requisitions.length === 0 && (
             <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No active requisitions found.</p>
             </div>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-[48px] bg-slate-900 text-white p-12 border-none shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                       <div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Service ID: {bridge.id}</p>
                          <h3 className="text-4xl font-black tracking-tighter">The Weekly Bridge</h3>
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${bridge.status === 'PREPARING' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-emerald-500 text-white'}`}>{bridge.status}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-12 mb-12">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Departure</p>
                          <p className="text-xl font-black flex items-center gap-2"><Calendar className="text-indigo-400" size={20}/> {bridge.dispatchDate}</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle Payload</p>
                          <div className="flex items-center gap-4">
                             <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${bridge.capacity}%` }}></div>
                             </div>
                             <span className="text-sm font-black">{bridge.capacity}%</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] mb-10">
                       <p className="text-[11px] text-indigo-200 font-medium leading-relaxed italic">
                         "This market-operated vehicle visits supplier hubs every Monday. Vendors aggregate demand to leverage bulk pricing. All goods are pre-inspected before return."
                       </p>
                    </div>

                    {isVendor && bridge.status === 'PREPARING' && (
                       <Button onClick={() => setShowBridgeForm(true)} className="w-full h-16 bg-white text-slate-900 border-none font-black uppercase tracking-widest text-xs hover:bg-indigo-50 shadow-2xl">Join Next Monday Dispatch</Button>
                    )}
                 </div>
                 <Truck className="absolute -right-16 -bottom-16 opacity-5 text-white" size={320} />
              </Card>

              <Card title="Bridge Manifest Ledger" className="rounded-[40px] shadow-xl border-slate-100 overflow-hidden p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <th className="px-8 py-5">Contingent Node</th>
                             <th className="px-8 py-5">Requested Commodity</th>
                             <th className="px-8 py-5">Allocation</th>
                             <th className="px-8 py-5 text-right">Settlement</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {bridge.items.map(item => (
                             <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                                <td className="px-8 py-6">
                                   <p className="text-sm font-black text-slate-800 tracking-tight">{item.vendorName}</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">{item.id}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <p className="text-sm font-black text-slate-800">{item.itemName}</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">Qty: {item.qty}</p>
                                </td>
                                <td className="px-8 py-6 text-sm font-black text-slate-900">UGX {item.estPrice.toLocaleString()}</td>
                                <td className="px-8 py-6 text-right">
                                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">CLEARED & PAID</span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </div>

           <div className="space-y-6">
              <Card title="Logistics Policy" className="rounded-[40px] shadow-xl border-slate-100">
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm"><DollarSign size={20}/></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight">Pre-Pay Mandate</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Vendors must clear estimated procurement costs prior to Monday dispatch. Ledger sync is mandatory.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm"><ShieldCheck size={20}/></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight">Supply Warranty</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Hub inspection nodes verify all returning bridge stock. Discrepancies settled via platform escrow.</p>
                       </div>
                    </div>
                 </div>
              </Card>
              
              <div className="bg-indigo-600 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                 <h4 className="text-xl font-black mb-2 tracking-tight">Bridge Token Logic</h4>
                 <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-6">Payment triggers a digital logistics pass verified at supplier hubs by the market driver.</p>
                 <div className="aspect-video bg-white/10 rounded-3xl border-2 border-white/10 flex items-center justify-center relative">
                    <QrCode className="text-white opacity-40 group-hover:opacity-100 transition-opacity" size={64}/>
                    <div className="absolute top-4 right-4 flex gap-1">
                       <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showBridgeForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <Card className="w-full max-w-xl shadow-2xl rounded-[40px] p-12 bg-white relative overflow-hidden border-none">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Join Weekly Dispatch</h3>
                 <button onClick={() => setShowBridgeForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={28}/></button>
              </div>
              <form onSubmit={handleJoinBridge} className="space-y-6">
                 <Input label="Target Commodity *" name="item" placeholder="e.g. Soya Oil (Bulk Jerricans)" required />
                 <div className="grid grid-cols-2 gap-6">
                    <Input label="Quantity *" name="qty" type="number" required />
                    <Input label="Estimated Total Price (UGX) *" name="price" type="number" required />
                 </div>
                 <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex gap-4">
                    <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase tracking-tight">
                       Finance Note: Pre-payment is required to confirm inclusion. Funds held in hub-escrow until driver verifies goods at supplier node.
                    </p>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Button variant="secondary" onClick={() => setShowBridgeForm(false)} className="flex-1 h-14 font-black uppercase text-[10px]">Cancel</Button>
                    <Button type="submit" className="flex-2 bg-indigo-600 border-none shadow-xl text-white h-14 font-black uppercase text-[10px]">Initialize Pre-Payment</Button>
                 </div>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
};
