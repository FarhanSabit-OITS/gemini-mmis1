import React, { useState, useMemo } from 'react';
import { 
  Warehouse, ShieldCheck, Star, Search, Filter, MapPin, 
  Truck, Info, X, MessageSquare, ChevronDown, Award,
  ExternalLink, BarChart3, Clock, AlertTriangle, CheckCircle2,
  Package, ThumbsUp, MoreHorizontal, ShoppingCart, Tag, Zap, ArrowRight,
  ShieldAlert, UserPlus, ClipboardList, Shield, UserCheck, Send
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Supplier, UserProfile, SupplierShowcaseItem } from '../../types';
import { KYCModule } from './KYCModule';

export const SuppliersNetwork = ({ user }: { user: UserProfile }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { 
      id: 'S-8801', 
      name: 'Nile Agro-Processing', 
      email: 'supply@nileagro.ug', 
      category: 'Cereals', 
      status: 'ACTIVE', 
      warehouseLocation: 'Jinja Industrial', 
      suppliedItemsCount: 42, 
      rating: 4.8, 
      totalRatings: 124, 
      kycValidated: true, 
      onboardingDate: '2023-01-12', 
      walletBalance: 0,
      showcase: [
        { id: 'SC-01', name: 'Premium Grade Maize', description: 'Sun-dried, moisture level below 12%.', priceRange: 'UGX 150k - 200k / Bag', category: 'Grain' },
        { id: 'SC-02', name: 'Refined Soya Beans', description: 'Export quality refined soya beans.', priceRange: 'UGX 300k - 400k / Bag', category: 'Legumes' }
      ]
    },
    { id: 'S-8802', name: 'Kampala Cold Storage', email: 'ops@kp-cold.ug', category: 'Dairy', status: 'ACTIVE', warehouseLocation: 'Bweyogerere', suppliedItemsCount: 12, rating: 4.5, totalRatings: 56, kycValidated: true, onboardingDate: '2023-05-20', walletBalance: 0, showcase: [] },
    { id: 'S-8803', name: 'Western Grain Hub', email: 'mbarara@grainhub.ug', category: 'Grains', status: 'PENDING', warehouseLocation: 'Mbarara City', suppliedItemsCount: 0, rating: 0, totalRatings: 0, kycValidated: false, onboardingDate: '2024-05-15', walletBalance: 0, showcase: [] },
    { id: 'S-8804', name: 'TechTools Wholesale', email: 'orders@techtools.ug', category: 'Electronics', status: 'ACTIVE', warehouseLocation: 'Industrial Area, KLA', suppliedItemsCount: 156, rating: 4.2, totalRatings: 89, kycValidated: true, onboardingDate: '2022-11-30', walletBalance: 0, showcase: [] },
  ]);

  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({ score: 5, comment: '' });
  
  const [requestForm, setRequestForm] = useState({
    item: '',
    qty: '',
    priority: 'MEDIUM',
    notes: ''
  });

  const isVendor = user.role === 'VENDOR';
  const isSupplierRole = user.role === 'SUPPLIER';
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MARKET_ADMIN';

  const filtered = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.warehouseLocation.toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  const handleRateSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setRatingForm({ score: 5, comment: '' });
    setShowRatingModal(true);
  };

  const handleRequestProduct = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setRequestForm({ item: '', qty: '', priority: 'MEDIUM', notes: '' });
    setShowRequestModal(true);
  };

  const submitRating = async () => {
    if (!selectedSupplier) return;
    setSuppliers(prev => prev.map(s => {
      if (s.id === selectedSupplier.id) {
        const newTotal = s.totalRatings + 1;
        const newRating = ((s.rating * s.totalRatings) + ratingForm.score) / newTotal;
        return { ...s, totalRatings: newTotal, rating: Number(newRating.toFixed(1)) };
      }
      return s;
    }));
    setShowRatingModal(false);
    alert("Audit log updated: Your performance feedback has been transmitted to the supplier trust ledger.");
  };

  const submitProductRequest = async () => {
    alert(`Requisition broadcasted! ${selectedSupplier?.name} has been notified of your request for ${requestForm.qty} ${requestForm.item}. Monitor 'Supply Requisitions' for bidding.`);
    setShowRequestModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl ring-4 ring-indigo-50">
             <Warehouse size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Suppliers Network</h2>
              <p className="text-slate-500 font-medium text-lg">Verified Bulk Distribution & Supply Chain Registry</p>
           </div>
        </div>
        <div className="flex gap-3">
          {isSupplierRole && !user.isVerified && (
            <Button onClick={() => setShowKYCModal(true)} className="h-12 px-6 bg-indigo-600 border-none font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">
               <ShieldCheck size={18}/> Finalize Node KYC
            </Button>
          )}
          <Button variant="outline" className="h-12 border-2 px-6 font-black uppercase text-xs tracking-widest"><BarChart3 size={18}/> Hub Trends</Button>
          {isAdmin && <Button className="h-12 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">Audit KYC Queue</Button>}
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input icon={Search} placeholder="Search network for certified suppliers..." value={search} onChange={(e:any) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer shadow-lg">
            <option>Rating: Any Level</option>
            <option>Elite (4.5+)</option>
            <option>Highly Reliable (4.0+)</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
        <div className="relative">
          <select className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer shadow-lg">
            <option>Compliance: All</option>
            <option>KYC Verified Only</option>
            <option>Pending Verification</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(supplier => (
          <Card key={supplier.id} className="p-0 overflow-hidden border-slate-100 hover:border-indigo-200 transition-all group shadow-xl rounded-[32px] relative">
             <div className="p-8">
               <div className="flex justify-between items-start mb-6">
                 <div className="flex gap-5">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 transition-colors shadow-lg">
                      {supplier.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        {supplier.name}
                        {supplier.kycValidated ? (
                           <ShieldCheck size={20} className="text-indigo-500" />
                        ) : (
                           <AlertTriangle size={20} className="text-amber-500" />
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{supplier.category} Node</span>
                         {!supplier.kycValidated && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 uppercase animate-pulse">Audit Required</span>}
                      </div>
                    </div>
                 </div>
                 <div className="text-right">
                   <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <Star size={18} fill={supplier.rating > 0 ? "currentColor" : "none"} />
                      <span className="text-lg font-black">{supplier.rating || 'N/A'}</span>
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{supplier.totalRatings} Audits</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-8 border-y border-slate-50 py-6">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Fulfillment Hub</p>
                    <p className="text-xs font-bold text-slate-800">{supplier.warehouseLocation}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Package size={12}/> Catalog Load</p>
                    <p className="text-xs font-bold text-slate-800">{supplier.showcase?.length || 0} Trade Entities</p>
                  </div>
               </div>

               <div className="flex gap-3">
                 <Button variant="secondary" onClick={() => setSelectedSupplier(supplier)} className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border-slate-200 shadow-sm hover:border-indigo-300">
                    Explore Showcase
                 </Button>
                 {isVendor && supplier.status === 'ACTIVE' && (
                    <div className="flex-1 flex gap-2">
                       <Button onClick={() => handleRequestProduct(supplier)} className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-indigo-600 border-none shadow-lg shadow-indigo-100">
                         <ShoppingCart size={14}/> RFQ
                       </Button>
                       {/* Fixed: title prop is now supported on Button component */}
                       <Button onClick={() => handleRateSupplier(supplier)} variant="outline" className="h-12 w-12 p-0 border-2" title="Rate Supplier">
                          <Star size={16} />
                       </Button>
                    </div>
                 )}
               </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl rounded-[40px] p-10 bg-white relative border-none">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Trust Audit</h3>
              <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={28}/></button>
            </div>
            <div className="text-center mb-8">
               <p className="text-slate-500 font-medium mb-4">Rate your transaction experience with <span className="font-black text-slate-900 underline">{selectedSupplier.name}</span></p>
               <div className="flex justify-center gap-2">
                 {[1,2,3,4,5].map(star => (
                   <button 
                     key={star} 
                     onClick={() => setRatingForm({...ratingForm, score: star})}
                     className={`p-1 transition-all hover:scale-125 ${star <= ratingForm.score ? 'text-amber-500' : 'text-slate-200'}`}
                   >
                     <Star size={40} fill={star <= ratingForm.score ? "currentColor" : "none"} />
                   </button>
                 ))}
               </div>
            </div>
            <Input 
              label="Performance Comments" 
              multiline 
              placeholder="Fulfillment speed, quality of goods, documentation integrity..." 
              value={ratingForm.comment}
              onChange={(e:any) => setRatingForm({...ratingForm, comment: e.target.value})}
            />
            <div className="flex gap-4 mt-8">
               <Button variant="secondary" className="flex-1" onClick={() => setShowRatingModal(false)}>Discard</Button>
               <Button className="flex-2 h-14 !bg-slate-900 border-none shadow-xl text-white font-black uppercase text-xs" onClick={submitRating}>
                 <UserCheck size={18}/> Commit Audit Entry
               </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Product Request Modal */}
      {showRequestModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
           <Card className="w-full max-w-lg shadow-2xl rounded-[40px] p-10 bg-white relative border-none">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-slate-900 uppercase">RFQ Initialization</h3>
                 <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600"><X size={28}/></button>
              </div>
              <div className="space-y-4">
                 <Input label="Target Commodity *" placeholder="e.g. Premium Basmati Rice" value={requestForm.item} onChange={(e:any)=>setRequestForm({...requestForm, item: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Target Quantity *" type="number" placeholder="0" value={requestForm.qty} onChange={(e:any)=>setRequestForm({...requestForm, qty: e.target.value})} />
                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Integrity Prio</label>
                       <select 
                        value={requestForm.priority}
                        onChange={(e)=>setRequestForm({...requestForm, priority: e.target.value})}
                        className="bg-black text-white p-4 rounded-2xl text-xs font-black uppercase outline-none shadow-xl border-2 border-slate-800"
                       >
                         <option value="LOW">Low Latency</option>
                         <option value="MEDIUM">Standard Cycle</option>
                         <option value="HIGH">Critical Logistics</option>
                       </select>
                    </div>
                 </div>
                 <Input label="Technical Context" multiline placeholder="Moisture levels, delivery coordinates, etc..." value={requestForm.notes} onChange={(e:any)=>setRequestForm({...requestForm, notes: e.target.value})} />
                 <div className="flex gap-4 pt-6">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowRequestModal(false)}>Abort</Button>
                    <Button className="flex-2 h-14 bg-indigo-600 border-none shadow-xl text-white font-black uppercase text-xs" onClick={submitProductRequest}>
                       <Send size={18}/> Broadcast Requisition
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {/* KYC Verification Modal */}
      {showKYCModal && (
        <div className="fixed inset-0 bg-white z-[250] overflow-y-auto animate-fade-in">
           <div className="max-w-4xl mx-auto py-12 px-6">
              <div className="flex justify-between items-center mb-12">
                 <button onClick={() => setShowKYCModal(false)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={24}/> <span className="font-black uppercase text-xs tracking-widest">Abort Verification</span>
                 </button>
                 <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg">M</div>
              </div>
              <KYCModule type="SUPPLIER" userEmail={user.email} onComplete={() => { setShowKYCModal(false); alert("Success: Your Supplier KYC dossier has been committed to the administrative ledger."); }} />
           </div>
        </div>
      )}
    </div>
  );
};