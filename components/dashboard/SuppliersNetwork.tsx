import React, { useState, useMemo } from 'react';
import { 
  Warehouse, ShieldCheck, Star, Search, Filter, MapPin, 
  Truck, Info, X, MessageSquare, ChevronDown, Award,
  ExternalLink, BarChart3, Clock, AlertTriangle, CheckCircle2,
  Package, ThumbsUp, MoreHorizontal, ShoppingCart, Tag, Zap, ArrowRight,
  ShieldAlert, UserPlus, ClipboardList, Shield, UserCheck, Send, Sparkles
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
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  
  const [requestForm, setRequestForm] = useState({
    item: '',
    qty: '',
    priority: 'MEDIUM',
    notes: ''
  });

  const isVendor = user.role === 'VENDOR';
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
    setRatingValue(5);
    setRatingComment('');
    setShowRatingModal(true);
  };

  // Fixed: Added handleRequestProduct to open RFQ modal for suppliers
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
        const newRating = ((s.rating * s.totalRatings) + ratingValue) / newTotal;
        return { ...s, totalRatings: newTotal, rating: Number(newRating.toFixed(1)) };
      }
      return s;
    }));
    setShowRatingModal(false);
    setSelectedSupplier(null);
    alert("Trust Ledger Synchronized: Performance data broadcasted to network.");
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
              <p className="text-slate-50 font-medium text-lg bg-black px-3 py-1 rounded-xl">Hub: REGIONAL-SYNC</p>
           </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 border-2 px-6 font-black uppercase text-xs tracking-widest"><BarChart3 size={18}/> Global Demand Index</Button>
          {isAdmin && <Button className="h-12 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 bg-indigo-600 text-white border-none">Audit Logistics Log</Button>}
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input icon={Search} placeholder="Search network for certified suppliers..." value={search} onChange={(e:any) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer shadow-lg">
            <option>Fulfillment Index: All</option>
            <option>Elite Tier (4.5+)</option>
            <option>Certified Hubs (4.0+)</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <div className="relative">
          <select className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer shadow-lg">
            <option>Security Status: All</option>
            <option>Validated Only</option>
            <option>Under Verification</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(supplier => (
          <Card key={supplier.id} className="p-0 overflow-hidden border-slate-100 hover:border-indigo-200 transition-all group shadow-xl rounded-[32px] relative bg-white">
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
                         <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{supplier.category} Center</span>
                         {!supplier.kycValidated && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 uppercase">Awaiting Audit</span>}
                      </div>
                    </div>
                 </div>
                 <div className="text-right">
                   <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <Star size={18} fill={supplier.rating > 0 ? "currentColor" : "none"} />
                      <span className="text-xl font-black">{supplier.rating || '---'}</span>
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{supplier.totalRatings} Network Audits</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-8 border-y border-slate-50 py-6">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Regional Fulfillment</p>
                    <p className="text-xs font-bold text-slate-800">{supplier.warehouseLocation}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Package size={12}/> Hub Resources</p>
                    <p className="text-xs font-bold text-slate-800">{supplier.showcase?.length || 0} Listed Commodities</p>
                  </div>
               </div>

               <div className="flex gap-3">
                 <Button variant="secondary" className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border-slate-200">
                    Sync Showcase
                 </Button>
                 {isVendor && supplier.status === 'ACTIVE' && (
                    <div className="flex-1 flex gap-2">
                       <Button onClick={() => handleRateSupplier(supplier)} className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-indigo-600 border-none shadow-lg shadow-indigo-100 text-white">
                         <Star size={14}/> Submit Review
                       </Button>
                       <Button onClick={() => handleRequestProduct(supplier)} variant="outline" className="h-12 w-12 p-0 border-2" title="Broadcast RFQ">
                          <Send size={16} />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md shadow-2xl rounded-[40px] p-10 bg-white relative border-none">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Trade Hub Audit</h3>
              <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-red-600 transition-colors p-2"><X size={28}/></button>
            </div>
            <div className="text-center mb-10">
               <p className="text-slate-500 font-medium mb-6">Rate your fulfillment experience with <span className="font-black text-slate-900 underline">{selectedSupplier.name}</span></p>
               <div className="flex justify-center gap-3">
                 {[1, 2, 3, 4, 5].map(star => (
                   <button 
                     key={star} 
                     onClick={() => setRatingValue(star)}
                     className={`p-2 transition-all hover:scale-110 ${star <= ratingValue ? 'text-amber-500' : 'text-slate-200'}`}
                   >
                     <Star size={42} fill={star <= ratingValue ? "currentColor" : "none"} />
                   </button>
                 ))}
               </div>
            </div>
            <Input 
              label="Operational Performance Feedback" 
              multiline 
              placeholder="Detail logistics speed, document integrity, and commodity quality..." 
              value={ratingComment}
              onChange={(e:any) => setRatingComment(e.target.value)}
            />
            <div className="flex gap-4 mt-8">
               <Button variant="secondary" className="flex-1 h-12 font-black uppercase text-xs" onClick={() => setShowRatingModal(false)}>Abort Sync</Button>
               <Button className="flex-2 h-14 bg-indigo-600 border-none shadow-xl text-white font-black uppercase text-xs" onClick={submitRating}>
                 <UserCheck size={18}/> Commit Network Audit
               </Button>
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-bold text-center mt-6 tracking-widest"><Sparkles className="inline mr-1" size={10}/> AI-Verified Performance Sync Node Active</p>
          </Card>
        </div>
      )}

      {/* Re-use modals from Vendors if needed */}
    </div>
  );
};