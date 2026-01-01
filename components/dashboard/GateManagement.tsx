
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Truck, LogIn, LogOut, DollarSign, Clock, ShieldCheck, 
  Printer, Camera, QrCode, Search, X, CheckCircle2, 
  AlertTriangle, CreditCard, ArrowRight, UserCheck, Ticket,
  LayoutGrid, History, Smartphone, Scan, User, RefreshCw, Star, Info, ChevronDown,
  Hash, Clipboard, Calculator, SlidersHorizontal, Activity, Zap
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GateRecord, ParkingSlot } from '../../types';

export const GateManagement = () => {
  const [activeTab, setActiveTab] = useState<'MANIFEST' | 'SCANNER' | 'SPATIAL'>('MANIFEST');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<any>(null);
  const [search, setSearch] = useState('');
  
  const TOTAL_SLOTS = 200;
  const [records, setRecords] = useState<GateRecord[]>([
    { id: 'GT-001', plate: 'UAX 123Z', type: 'SUPPLIER', timeIn: '08:45 AM', status: 'INSIDE', charge: 5000, paymentStatus: 'PAID', token: 'MM-4219' },
    { id: 'GT-002', plate: 'UBB 990X', type: 'VENDOR', timeIn: '09:12 AM', timeOut: '11:05 AM', status: 'EXITED', charge: 2000, paymentStatus: 'PAID', token: 'MM-1123' },
  ]);

  const [parkingSlots] = useState<ParkingSlot[]>(
    Array.from({ length: TOTAL_SLOTS }).map((_, i) => ({
      id: `P-${i + 1}`,
      zone: i < 50 ? 'ALPHA' : i < 150 ? 'BETA' : 'GAMMA',
      status: i % 7 === 0 ? 'OCCUPIED' : 'AVAILABLE'
    }))
  );

  const stats = useMemo(() => {
    const active = records.filter(r => r.status === 'INSIDE').length;
    return {
      active,
      capacity: Math.round((active / TOTAL_SLOTS) * 100),
      totalFee: records.reduce((acc, r) => acc + (r.charge || 0), 0)
    };
  }, [records]);

  const [entryForm, setEntryForm] = useState({ plate: '', type: 'VISITOR' });

  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: GateRecord = {
      id: 'GT-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      plate: entryForm.plate.toUpperCase(),
      type: entryForm.type,
      timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'INSIDE',
      charge: 2000,
      paymentStatus: 'PENDING',
      token: 'MM-' + Math.floor(1000 + Math.random() * 9000)
    };
    setRecords([newRecord, ...records]);
    setGeneratedToken(newRecord);
    setShowEntryModal(false);
  };

  const handleExit = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'EXITED', timeOut: 'Now', paymentStatus: 'PAID' } : r));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-slate-900 text-white p-8 rounded-[48px] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5 relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-6">
           <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl ring-8 ring-indigo-600/20 group-hover:rotate-12 transition-transform duration-500">
             <Truck size={40} />
           </div>
           <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Gate Terminal</h2>
              <div className="flex items-center gap-3 mt-4">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5"><Activity size={12}/> Node: DELTA-7</span>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">{stats.capacity}% Load</span>
              </div>
           </div>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
           <Button onClick={() => setActiveTab('SCANNER')} variant="secondary" className="flex-1 h-16 !bg-white/10 !text-white border-white/10 font-black uppercase text-xs px-8">Optical Triage</Button>
           <Button onClick={() => setShowEntryModal(true)} className="flex-2 h-16 px-12 font-black uppercase tracking-widest text-xs bg-indigo-600 border-none shadow-2xl hover:scale-105 transition-transform">
             <LogIn size={20} /> Authorize Entry
           </Button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="p-8 rounded-[40px] shadow-xl border-slate-100 flex items-center gap-6 group hover:border-indigo-200 transition-all">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Truck size={28}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Manifests</p><p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.active}</p></div>
         </Card>
         <Card className="p-8 rounded-[40px] shadow-xl border-slate-100 flex items-center gap-6 group hover:border-emerald-200 transition-all">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><DollarSign size={28}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gate Revenue</p><p className="text-3xl font-black text-slate-900 tracking-tighter">UGX {stats.totalFee/1000}k</p></div>
         </Card>
         <Card className="p-8 rounded-[40px] shadow-xl border-slate-100 flex items-center gap-6 group hover:border-amber-200 transition-all">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><History size={28}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Dwell Time</p><p className="text-3xl font-black text-slate-900 tracking-tighter">42 <span className="text-xs">MIN</span></p></div>
         </Card>
         <Card className="p-8 rounded-[40px] shadow-xl border-slate-100 flex items-center gap-6 group hover:border-purple-200 transition-all">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><ShieldCheck size={28}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Score</p><p className="text-3xl font-black text-slate-900 tracking-tighter">99.2<span className="text-xs">%</span></p></div>
         </Card>
      </div>

      <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('MANIFEST')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'MANIFEST' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Manifest Log</button>
        <button onClick={() => setActiveTab('SCANNER')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'SCANNER' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Optical Sync</button>
        <button onClick={() => setActiveTab('SPATIAL')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'SPATIAL' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Spatial Grid</button>
      </div>

      {activeTab === 'MANIFEST' && (
        <Card className="rounded-[48px] shadow-2xl border-none p-0 overflow-hidden bg-white">
           <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                 <input placeholder="Filter by Plate, ID, or Token..." className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner"/>
              </div>
              <Button variant="secondary" className="h-12 border-none shadow-sm"><SlidersHorizontal size={18}/> Filters</Button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <th className="px-8 py-5">Vehicle Entity</th>
                       <th className="px-8 py-5">Classification</th>
                       <th className="px-8 py-5">Entry Time</th>
                       <th className="px-8 py-5">Toll Status</th>
                       <th className="px-8 py-5 text-right">Ops</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {records.filter(r => r.status === 'INSIDE').map(r => (
                       <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                             <p className="text-base font-black text-slate-900 tracking-tight">{r.plate}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">TOKEN: {r.token}</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[8px] font-black uppercase tracking-widest">{r.type}</span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-600">{r.timeIn}</td>
                          <td className="px-8 py-6">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest ${
                                r.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                             }`}>{r.paymentStatus}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <Button onClick={() => handleExit(r.id)} variant="danger" className="h-10 px-6 font-black uppercase text-[10px] tracking-widest bg-red-500 border-none">Exit Hub</Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </Card>
      )}

      {activeTab === 'SCANNER' && (
        <div className="max-w-2xl mx-auto space-y-8 animate-slide-up pt-10">
           <Card className="rounded-[56px] shadow-2xl border-none p-16 text-center bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                 <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-white/20 shadow-2xl">
                    <Scan size={48} className="text-indigo-400 animate-pulse" />
                 </div>
                 <h3 className="text-3xl font-black tracking-tight mb-4 uppercase">Sync Optical Node</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed mb-12 max-w-sm mx-auto">Focus terminal camera on the vehicle entry pass or supplier manifest token to verify integrity.</p>
                 
                 <div className="aspect-video bg-black rounded-[40px] mb-12 border-4 border-white/5 relative group overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="w-64 h-64 border-2 border-indigo-500/40 rounded-[48px] animate-ping opacity-20"></div>
                    <div className="w-48 h-48 border-4 border-indigo-500/60 rounded-[40px] absolute animate-pulse"></div>
                    <div className="w-1 h-full bg-indigo-500/30 absolute shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-scan-y"></div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] z-10">Waiting for Signal...</p>
                 </div>

                 <Button className="w-full py-6 font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-900/40 bg-indigo-600 border-none rounded-3xl">Initialize Local Sensor</Button>
              </div>
           </Card>
        </div>
      )}

      {activeTab === 'SPATIAL' && (
        <Card className="rounded-[48px] shadow-2xl p-12 border-none">
           <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3"><LayoutGrid className="text-indigo-600"/> Spatial Capacity Monitor</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><span className="text-[10px] font-black uppercase text-slate-400">Occupied</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-100"></div><span className="text-[10px] font-black uppercase text-slate-400">Available</span></div>
              </div>
           </div>
           <div className="grid grid-cols-10 gap-3">
              {parkingSlots.map(slot => (
                 <div key={slot.id} className={`aspect-square rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center text-[8px] font-black ${
                    slot.status === 'OCCUPIED' ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-indigo-200'
                 }`}>
                    {slot.id.replace('P-', '')}
                 </div>
              ))}
           </div>
        </Card>
      )}

      {showEntryModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <Card className="w-full max-w-xl rounded-[48px] p-12 bg-white relative overflow-hidden shadow-2xl border-none">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Authorize Entry</h3>
                 <button onClick={() => setShowEntryModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={32}/></button>
              </div>
              <form onSubmit={handleEntry} className="space-y-8">
                 <Input label="Vehicle Plate Identification *" placeholder="UAX 000P" icon={Truck} value={entryForm.plate} onChange={(e:any)=>setEntryForm({...entryForm, plate:e.target.value})}/>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Entity Classification</label>
                    <select value={entryForm.type} onChange={(e:any)=>setEntryForm({...entryForm, type:e.target.value})} className="bg-black text-white p-4 rounded-2xl font-black uppercase text-xs outline-none border-2 border-slate-800 shadow-xl appearance-none">
                       <option value="VISITOR">Private Visitor</option>
                       <option value="SUPPLIER">Bulk Supplier</option>
                       <option value="VENDOR">Market Vendor</option>
                       <option value="STAFF">Official / Staff</option>
                    </select>
                 </div>
                 <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-2">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Entry Toll Logic</p>
                    <div className="flex justify-between items-end">
                       <p className="text-2xl font-black text-indigo-900">UGX 2,000</p>
                       <p className="text-[10px] text-indigo-400 font-bold italic">Billed to Entity Wallet</p>
                    </div>
                 </div>
                 <Button type="submit" className="w-full h-16 bg-indigo-600 border-none shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs rounded-2xl">Confirm Check-In</Button>
              </form>
           </Card>
        </div>
      )}

      {generatedToken && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
           <Card className="w-full max-w-sm text-center py-12 rounded-[56px] border-none bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
              <button onClick={() => setGeneratedToken(null)} className="absolute top-8 right-8 text-slate-400 p-2"><X size={28}/></button>
              <div className="w-24 h-24 bg-slate-900 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                 <Ticket size={48} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{generatedToken.token}</h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-8">Authorized Pass</p>
              <div className="bg-slate-50 p-6 mx-8 rounded-3xl text-left space-y-3 mb-10 border border-slate-100 shadow-inner">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Plate:</span><span className="text-slate-900">{generatedToken.plate}</span></div>
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Zone:</span><span className="text-indigo-600">ALPHA-BETA</span></div>
              </div>
              <Button onClick={() => setGeneratedToken(null)} className="w-full h-16 bg-slate-900 text-white border-none font-black uppercase text-xs rounded-[28px] mx-auto block max-w-[240px]">Sync Terminal</Button>
           </Card>
        </div>
      )}
    </div>
  );
};
