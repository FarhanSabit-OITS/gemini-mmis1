
import React, { useState } from 'react';
import { 
  Store, Building, LayoutGrid, Package, CheckCircle2, 
  ChevronRight, MapPin, DollarSign, Plus, Trash2, Camera,
  ShieldCheck, AlertCircle, Info, Send
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Product, UserProfile } from '../../types';
import { CITIES_AND_MARKETS, STORE_LEVELS, STORE_SECTIONS } from '../../constants';

interface VendorOnboardingProps {
  user: UserProfile;
  onComplete: () => void;
}

export const VendorOnboarding = ({ user, onComplete }: VendorOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: '',
    category: 'General',
    city: '',
    market: '',
    level: 'Ground Floor',
    section: 'Aisle A'
  });
  const [products, setProducts] = useState<Partial<Product>[]>([
    { id: 'INIT-1', name: '', price: 0, stock: 0, category: 'General' }
  ]);

  const addProduct = () => setProducts([...products, { id: 'INIT-' + (products.length + 1), name: '', price: 0, stock: 0, category: 'General' }]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));

  const steps = [
    { n: 1, t: 'Business Identity', d: 'Configure your trade node parameters.', i: Store },
    { n: 2, t: 'Spatial Allocation', d: 'Define your hub location coordinates.', i: MapPin },
    { n: 3, t: 'Initial Catalog', d: 'Initialize your global product ledger.', i: Package },
    { n: 4, t: 'Verification', d: 'Sync with administrative audit.', i: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-8 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Vendor Node Initialization</h2>
          <div className="flex justify-center items-center gap-4">
             {steps.map(s => (
               <div key={s.n} className="flex items-center">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= s.n ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'}`}>
                   {step > s.n ? <CheckCircle2 size={20}/> : s.n}
                 </div>
                 {s.n < 4 && <div className={`w-8 h-1 mx-2 rounded-full ${step > s.n ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>}
               </div>
             ))}
          </div>
        </div>

        <Card className="p-12 rounded-[48px] shadow-2xl border-none relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          
          <div className="flex items-center gap-6 mb-12">
             <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center shadow-inner">
               {React.createElement(steps[step-1].i, { size: 32 })}
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{steps[step-1].t}</h3>
                <p className="text-slate-500 font-medium">{steps[step-1].d}</p>
             </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              <Input label="Operational Entity Name *" placeholder="e.g. Mukasa General Trade" value={form.businessName} onChange={(e:any)=>setForm({...form, businessName: e.target.value})} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Primary Sector</label>
                <select 
                  className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-600 outline-none appearance-none shadow-xl transition-all"
                  value={form.category}
                  onChange={(e)=>setForm({...form, category: e.target.value})}
                >
                  <option value="General">General Retail</option>
                  <option value="Food">Food & Produce</option>
                  <option value="Electronics">Electronics & Hardware</option>
                  <option value="Clothing">Apparel & Textiles</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Allocation City</label>
                <select 
                  className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-600 outline-none appearance-none shadow-xl transition-all"
                  value={form.city}
                  onChange={(e)=>setForm({...form, city: e.target.value, market: ''})}
                >
                  <option value="">Select Region</option>
                  {CITIES_AND_MARKETS.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Market Node</label>
                <select 
                  className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-600 outline-none appearance-none shadow-xl transition-all"
                  value={form.market}
                  disabled={!form.city}
                  onChange={(e)=>setForm({...form, market: e.target.value})}
                >
                  <option value="">Choose Hub</option>
                  {CITIES_AND_MARKETS.find(c => c.city === form.city)?.markets.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Spatial Level</label>
                <select 
                  className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-600 outline-none appearance-none shadow-xl transition-all"
                  value={form.level}
                  onChange={(e)=>setForm({...form, level: e.target.value})}
                >
                  {STORE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Operational Section</label>
                <select 
                  className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-600 outline-none appearance-none shadow-xl transition-all"
                  value={form.section}
                  onChange={(e)=>setForm({...form, section: e.target.value})}
                >
                  {STORE_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div className="max-h-80 overflow-y-auto custom-scrollbar pr-4 space-y-4">
                {products.map((p, i) => (
                  <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-12 gap-4 items-end group">
                    <div className="col-span-5"><Input label="Commodity Name" placeholder="e.g. Soya Beans" value={p.name} onChange={(e:any)=>{const newP=[...products]; newP[i].name=e.target.value; setProducts(newP);}} /></div>
                    <div className="col-span-3"><Input label="Price (UGX)" type="number" placeholder="0" value={p.price?.toString()} onChange={(e:any)=>{const newP=[...products]; newP[i].price=Number(e.target.value); setProducts(newP);}} /></div>
                    <div className="col-span-2"><Input label="Initial Qty" type="number" placeholder="0" value={p.stock?.toString()} onChange={(e:any)=>{const newP=[...products]; newP[i].stock=Number(e.target.value); setProducts(newP);}} /></div>
                    <div className="col-span-2 pb-5"><Button variant="ghost" onClick={()=>removeProduct(i)} className="text-red-400 hover:text-red-600 w-full"><Trash2 size={18}/></Button></div>
                  </div>
                ))}
              </div>
              <Button onClick={addProduct} variant="outline" className="w-full py-4 border-2 border-dashed font-black uppercase text-[10px]"><Plus size={16}/> Add Commodity Placeholder</Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-6 bg-slate-900 text-white rounded-[32px] text-center shadow-xl">
                   <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Entity</p>
                   <p className="font-black truncate uppercase">{form.businessName}</p>
                 </div>
                 <div className="p-6 bg-slate-50 text-slate-800 rounded-[32px] text-center border border-slate-100 shadow-inner">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Hub Allocation</p>
                   <p className="font-black truncate uppercase">{form.market}</p>
                 </div>
                 <div className="p-6 bg-slate-50 text-slate-800 rounded-[32px] text-center border border-slate-100 shadow-inner">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Catalog Load</p>
                   <p className="font-black truncate uppercase">{products.length} Units</p>
                 </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-[40px] p-10 text-center hover:border-indigo-600 transition-all cursor-pointer bg-indigo-50/20 group">
                 <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                   <Camera size={32} className="text-indigo-600" />
                 </div>
                 <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Upload Trade Identification</h4>
                 <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mt-2 italic">Capture your NIN, TIN, or Market Permit to triangulate your node status.</p>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl flex gap-5 border border-amber-100">
                <Info className="text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-700 leading-relaxed font-bold uppercase">
                  System Finalization: By committing this registry, your credentials will be routed to the <span className="underline">{form.market} Admin Terminal</span> for spatial verification. Access is granted within 48 cycles.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-12 pt-8 border-t border-slate-100">
            <Button variant="ghost" className="font-black uppercase text-[10px] px-8" onClick={() => step > 1 && setStep(step - 1)}>
              {step === 1 ? 'Abort Node Sync' : 'Previous Module'}
            </Button>
            <Button className="font-black uppercase text-[10px] px-12 h-14 shadow-2xl" onClick={() => step < 4 ? setStep(step + 1) : onComplete()}>
              {step === 4 ? 'Commit to Registry' : 'Continue Visualization'} <ChevronRight size={16} className="ml-1"/>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
