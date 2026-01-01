
import React, { useMemo, useState } from 'react';
import { 
  DollarSign, TrendingUp, ArrowUpRight, 
  ArrowDownLeft, PieChart, Calculator, Landmark, 
  Download, Wallet, Zap, Smartphone, CheckCircle2,
  Clock, CreditCard, Receipt, Users, Building, ShieldCheck,
  Search, ListFilter, RefreshCw, X, MoreVertical, Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Transaction } from '../../types';

export const RevenueModule = () => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'COLLECTIONS' | 'WALLET'>('ANALYTICS');
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [posMode, setPosMode] = useState<'CASH' | 'MOMO'>('MOMO');

  const financialData = [
    { month: 'Jan', rent: 4500000, vat: 1200000, gate: 800000 },
    { month: 'Feb', rent: 5200000, vat: 1400000, gate: 950000 },
    { month: 'Mar', rent: 4800000, vat: 1100000, gate: 820000 },
    { month: 'Apr', rent: 6100000, vat: 1800000, gate: 1200000 },
    { month: 'May', rent: 5900000, vat: 1650000, gate: 1100000 },
    { month: 'Jun', rent: 7200000, vat: 2100000, gate: 1450000 },
  ];

  const transactions: Transaction[] = [
    { id: 'TX-9021', date: '2024-05-18 10:45', amount: 150000, type: 'RENT', status: 'SUCCESS', method: 'MTN_MOMO', direction: 'IN', referenceId: '821221' },
    { id: 'TX-9022', date: '2024-05-18 11:20', amount: 5000, type: 'GATE_FEE', status: 'SUCCESS', method: 'CASH', direction: 'IN', referenceId: 'G-102' },
    { id: 'TX-9023', date: '2024-05-18 12:05', amount: 25000, type: 'SERVICE_CHARGE', status: 'PENDING', method: 'AIRTEL_MONEY', direction: 'IN' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl ring-4 ring-emerald-50">
             <Landmark size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Revenue Hub</h2>
              <p className="text-slate-500 font-medium text-lg">Central Settlement & MFS Node Management</p>
           </div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" onClick={() => setActiveTab('COLLECTIONS')} className="h-12 px-6 font-black uppercase text-xs tracking-widest border-2">
             <Smartphone size={18}/> MFS Sync
           </Button>
           <Button onClick={() => setShowPOSModal(true)} className="shadow-2xl shadow-emerald-200 h-12 px-8 font-black uppercase tracking-widest text-xs bg-emerald-600 border-none text-white">
              <Plus size={18} /> Collection POS
           </Button>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('ANALYTICS')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ANALYTICS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>BI Dashboard</button>
        <button onClick={() => setActiveTab('COLLECTIONS')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'COLLECTIONS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>POS Log</button>
        <button onClick={() => setActiveTab('WALLET')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'WALLET' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Hub Wallet</button>
      </div>

      {activeTab === 'ANALYTICS' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-900 text-white p-8 rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Aggregate Volume</p>
              <div className="relative z-10">
                  <p className="text-4xl font-black tracking-tighter">UGX 84.2M</p>
                  <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <TrendingUp size={16}/> +14.5% Index
                  </div>
              </div>
              <Wallet size={120} className="absolute -right-4 -bottom-4 opacity-5 text-white" />
            </Card>
            <Card className="p-8 rounded-[40px] shadow-xl border-l-8 border-l-indigo-600 group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MFS Settlements</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">68% <span className="text-xs opacity-40">MOMO</span></p>
              <p className="text-[10px] text-indigo-600 font-bold uppercase mt-2">Active Webhook Sync</p>
            </Card>
            <Card className="p-8 rounded-[40px] shadow-xl border-l-8 border-l-purple-600 group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Regional VAT</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">UGX 18.2M</p>
              <p className="text-[10px] text-purple-600 font-bold uppercase mt-2">URA Push: ACTIVE</p>
            </Card>
            <Card className="p-8 rounded-[40px] shadow-xl border-l-8 border-l-emerald-500 group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gate Revenue</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">UGX 4.8M</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase mt-2">12k Vehicles Scanned</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-[48px] shadow-2xl border-none p-10 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp size={24} className="text-indigo-600"/> Revenue Stream Flow
                  </h3>
                  <Button variant="ghost" className="text-[10px] font-black uppercase text-indigo-600">Export XLS</Button>
              </div>
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialData}>
                        <defs>
                          <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                        <Area type="monotone" dataKey="rent" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRent)" />
                        <Area type="monotone" dataKey="vat" stroke="#8b5cf6" strokeWidth={4} fill="transparent" />
                        <Area type="monotone" dataKey="gate" stroke="#4f46e5" strokeWidth={4} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-[48px] shadow-xl p-10">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Method Distribution</h3>
              <div className="space-y-6">
                 {[
                   { l: 'MTN Mobile Money', v: '45%', c: 'bg-amber-400' },
                   { l: 'Airtel Money', v: '23%', c: 'bg-red-500' },
                   { l: 'Bank Transfer', v: '18%', c: 'bg-indigo-600' },
                   { l: 'Cash / Manual', v: '14%', c: 'bg-slate-400' },
                 ].map(m => (
                   <div key={m.l} className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-500">{m.l}</span>
                       <span className="text-slate-900">{m.v}</span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${m.c} transition-all duration-1000`} style={{ width: m.v }}></div>
                     </div>
                   </div>
                 ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'COLLECTIONS' && (
        <Card className="rounded-[40px] shadow-2xl border-none p-0 overflow-hidden bg-white">
           <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                 <input placeholder="Search transactions, MOMO IDs..." className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner"/>
              </div>
              <div className="flex gap-2">
                 <Button variant="secondary" className="h-12 border-none shadow-sm"><ListFilter size={18}/> Filter</Button>
                 <Button variant="secondary" className="h-12 border-none shadow-sm"><Download size={18}/> CSV</Button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <th className="px-8 py-5">TX Descriptor</th>
                       <th className="px-8 py-5">Integrity</th>
                       <th className="px-8 py-5">Method Node</th>
                       <th className="px-8 py-5 text-right">Aggregate Amount</th>
                       <th className="px-8 py-5 text-right">Timestamp</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {transactions.map(tx => (
                       <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                             <p className="text-sm font-black text-slate-900 font-mono tracking-tight">{tx.id}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.type.replace('_', ' ')}</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest ${
                                tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>{tx.status}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                   tx.method === 'MTN_MOMO' ? 'bg-amber-100 text-amber-700' : 
                                   tx.method === 'AIRTEL_MONEY' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                   <Smartphone size={14}/>
                                </div>
                                <span className="text-xs font-black uppercase text-slate-700 tracking-tighter">{tx.method.replace('_', ' ')}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-slate-900 tracking-tighter">
                             UGX {tx.amount.toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">
                             {tx.date}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </Card>
      )}

      {activeTab === 'WALLET' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
           <Card className="bg-slate-900 text-white p-12 rounded-[56px] border-none shadow-2xl relative overflow-hidden text-center">
              <div className="relative z-10">
                 <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20">
                    <Wallet size={40} className="text-emerald-400" />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Escrow Node Balance</h3>
                 <p className="text-7xl font-black tracking-tighter mb-4">UGX 12.5M</p>
                 <div className="flex justify-center gap-6 mt-12">
                    <Button className="h-16 px-12 bg-white text-slate-900 border-none font-black uppercase text-xs rounded-2xl shadow-xl hover:bg-emerald-50">Withdrawal Registry</Button>
                    <Button variant="secondary" className="h-16 px-12 !bg-white/10 !text-white border-none font-black uppercase text-xs rounded-2xl">Transfer Hub-to-Hub</Button>
                 </div>
              </div>
              <ShieldCheck size={400} className="absolute -left-20 -bottom-20 opacity-5 text-white" />
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="MTN MOMO Node" className="rounded-[40px] shadow-xl border-slate-100">
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-2xl font-black text-slate-900">UGX 4.2M</p>
                       <p className="text-[10px] text-amber-600 font-bold uppercase">Syncing with MTN Switch...</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg"><Smartphone size={24}/></div>
                 </div>
              </Card>
              <Card title="Bank Reserve" className="rounded-[40px] shadow-xl border-slate-100">
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-2xl font-black text-slate-900">UGX 8.3M</p>
                       <p className="text-[10px] text-indigo-600 font-bold uppercase">Verified Ledger Position</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Landmark size={24}/></div>
                 </div>
              </Card>
           </div>
        </div>
      )}

      {showPOSModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <Card className="w-full max-w-xl rounded-[48px] p-12 bg-white relative overflow-hidden shadow-2xl border-none">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Collections POS</h3>
                 <button onClick={() => setShowPOSModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={32}/></button>
              </div>
              <div className="space-y-8">
                 <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                    <button onClick={() => setPosMode('MOMO')} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${posMode === 'MOMO' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>MFS Request</button>
                    <button onClick={() => setPosMode('CASH')} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${posMode === 'CASH' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Cash Entry</button>
                 </div>

                 <div className="space-y-6">
                    <Input label="Collection Amount (UGX) *" placeholder="0.00" type="number" icon={DollarSign} />
                    {posMode === 'MOMO' ? (
                       <Input label="Subscriber Phone Number *" placeholder="07xx xxxxxx" icon={Smartphone} />
                    ) : (
                       <Input label="Depositor / Vendor Name *" placeholder="Entity Designation" icon={Users} />
                    )}
                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Flow Category</label>
                       <select className="bg-black text-white p-4 rounded-2xl font-black uppercase text-xs outline-none border-2 border-slate-800 shadow-xl appearance-none">
                          <option>Vendor Rent</option>
                          <option>Regional VAT</option>
                          <option>Gate Entry Toll</option>
                          <option>Registry License</option>
                       </select>
                    </div>
                 </div>

                 <Button className="w-full h-16 bg-indigo-600 border-none shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs rounded-2xl">Initialize Transaction</Button>
                 <p className="text-center text-[10px] text-slate-400 font-medium italic">"MFS requests trigger an interactive USSD push to the subscriber device."</p>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};
