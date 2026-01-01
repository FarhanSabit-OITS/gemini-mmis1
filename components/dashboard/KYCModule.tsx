
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Camera, CheckCircle2, AlertTriangle, 
  MapPin, Building, Info, UserCircle, Briefcase, 
  ChevronDown, Send, FileText, UserPlus, ArrowRight,
  FileCheck, Globe, Scale, Lock, Eye, Download, Upload, Trash2,
  Warehouse, Clock
} from 'lucide-react';
import { z } from 'zod';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CITIES_AND_MARKETS } from '../../constants';
import { Role } from '../../types';

const kycSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  idNumber: z.string().min(5, "Valid ID number is required"),
  city: z.string().min(1, "Location (City) selection is mandatory"),
  market: z.string().min(1, "Market hub selection is mandatory"),
  businessName: z.string().min(3, "Business name is required"),
  requestedRole: z.string().min(1, "Target role is required"),
  email: z.string().email()
}).refine((data) => {
  if (data.requestedRole === 'MARKET_ADMIN') {
    return data.email.toLowerCase().endsWith('@mmis.tevas.ug');
  }
  return true;
}, {
  message: "Market Admin applications require an official @mmis.tevas.ug email domain.",
  path: ["email"]
});

interface KYCProps {
  type: 'VENDOR' | 'SUPPLIER' | 'ADMIN';
  userEmail: string;
  onComplete: () => void;
  initialData?: any;
  readOnly?: boolean;
}

export const KYCModule = ({ type, userEmail, onComplete, initialData, readOnly = false }: KYCProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDocType, setCurrentDocType] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    idNumber: initialData?.idNumber || '',
    city: initialData?.city || '',
    market: initialData?.market || '',
    businessName: initialData?.businessName || '',
    businessType: initialData?.businessType || (type === 'SUPPLIER' ? 'Wholesale' : 'Retail'),
    requestedRole: initialData?.requestedRole || (type === 'ADMIN' ? 'MARKET_ADMIN' : type) as Role
  });

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({
        ...prev,
        ...initialData,
        businessType: initialData.businessType || prev.businessType,
        requestedRole: initialData.requestedRole || prev.requestedRole
      }));
    }
  }, [initialData]);

  const marketsForCity = useMemo(() => {
    return CITIES_AND_MARKETS.find(c => c.city === form.city)?.markets || [];
  }, [form.city]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file && currentDocType) {
      setDocuments({ ...documents, [currentDocType]: file.name });
      setCurrentDocType(null);
    }
  };

  const removeDoc = (type: string) => {
    if (readOnly) return;
    const newDocs = { ...documents };
    delete newDocs[type];
    setDocuments(newDocs);
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    setErrors({});
    const validationResult = kycSchema.safeParse({ ...form, email: userEmail });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (type === 'SUPPLIER' && Object.keys(documents).length < 2) {
      alert("Supplier Verification Error: At least two (2) primary trade documents are required for bulk node authorization.");
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2500));
    setSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      onComplete();
    }, 4000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 border-4 border-white">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">KYC Dossier Transmitted</h2>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed max-w-md mx-auto">
          Your credentials for <span className="text-indigo-600 font-bold">{form.requestedRole}</span> access are now in the verification pipeline.
        </p>
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl inline-block text-left w-full max-w-sm">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-800 pb-2">Registry Token: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
           <div className="space-y-3">
             <div className="flex justify-between text-xs">
                <span className="opacity-60">Status:</span>
                <span className="text-amber-400 font-bold uppercase">Manual Review</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="opacity-60">Hub Node:</span>
                <span className="font-bold">{form.market || 'Global'}</span>
             </div>
           </div>
        </div>
      </div>
    );
  }

  const kycDocs = type === 'SUPPLIER' ? [
    { id: 'REG', label: 'Business Registration (URSB)', required: true },
    { id: 'LIC', label: 'Supplier Trade License', required: true },
    { id: 'TAX', label: 'Tax Clearance Certificate', required: false },
    { id: 'ISO', label: 'Quality Certification (Optional)', required: false },
  ] : [
    { id: 'NIN', label: 'National ID (NIN)', required: true },
    { id: 'PERMIT', label: 'Market Vendor Permit', required: true },
    { id: 'PHOTO', label: 'Entity Profile Photo', required: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50">
            {type === 'SUPPLIER' ? <Warehouse size={40}/> : type === 'ADMIN' ? <ShieldCheck size={40}/> : <UserPlus size={40}/>}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {readOnly ? 'KYC Dossier Review' : (type === 'SUPPLIER' ? 'Supplier Network Onboarding' : type === 'ADMIN' ? 'Admin Credential Verification' : 'Vendor Identity Verification')}
            </h2>
            <p className="text-slate-500 font-medium text-lg">Official Hub Registration & Trade Compliance Audit</p>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm flex items-center gap-2">
           <Lock size={14}/> Secure AES-256 Protocol
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card title="1. Entity Profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Legal Entity Name *" placeholder="e.g. Nile Logistics Hub" value={form.businessName} onChange={(e:any)=>setForm({...form, businessName: e.target.value})} disabled={readOnly} error={errors.businessName} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest px-1">Industry Classification</label>
                <select 
                  className="w-full bg-black text-white border-2 border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-indigo-600 outline-none appearance-none shadow-xl disabled:opacity-70"
                  value={form.businessType}
                  onChange={(e)=>setForm({...form, businessType: e.target.value})}
                  disabled={readOnly}
                >
                  <option value="Retail">Retail Management</option>
                  <option value="Wholesale">Bulk Distribution</option>
                  <option value="Agro">Agro-Processing</option>
                  <option value="Import">International Trade</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Clothing">Clothing</option>
                  <option value="General">General</option>
                </select>
              </div>
              <Input label="Registry ID / NIN / TIN *" placeholder="Input verified code" value={form.idNumber} onChange={(e:any)=>setForm({...form, idNumber: e.target.value})} disabled={readOnly} error={errors.idNumber} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest px-1">Requested Privilege</label>
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{form.requestedRole}</div>
              </div>
            </div>
          </Card>

          <Card title="2. Personal Credentials">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Authorized First Name *" placeholder="John" value={form.firstName} onChange={(e:any)=>setForm({...form, firstName: e.target.value})} disabled={readOnly} error={errors.firstName} />
              <Input label="Authorized Last Name *" placeholder="Doe" value={form.lastName} onChange={(e:any)=>setForm({...form, lastName: e.target.value})} disabled={readOnly} error={errors.lastName} />
            </div>
          </Card>

          <Card title="3. Regional Allocation">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                   <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest px-1">Operational City *</label>
                   <select 
                     value={form.city}
                     onChange={(e)=>setForm({...form, city: e.target.value, market: ''})}
                     className={`w-full bg-black text-white border-2 ${errors.city ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm font-bold focus:border-indigo-600 outline-none shadow-xl appearance-none disabled:opacity-70`}
                     disabled={readOnly}
                   >
                     <option value="">Select Region</option>
                     {CITIES_AND_MARKETS.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                   </select>
                </div>
                <div className="flex flex-col gap-1.5">
                   <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest px-1">Market Hub *</label>
                   <select 
                     value={form.market}
                     onChange={(e)=>setForm({...form, market: e.target.value})}
                     disabled={!form.city || readOnly}
                     className={`w-full bg-black text-white border-2 ${errors.market ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm font-bold focus:border-indigo-600 outline-none shadow-xl disabled:opacity-30 appearance-none`}
                   >
                     <option value="">{form.city ? 'Select Center' : 'Lock: Select City'}</option>
                     {marketsForCity.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                </div>
             </div>
          </Card>

          <Card title="4. Operational Documentation">
             <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed max-w-lg">
               Upload high-resolution scans of your trade credentials. PDF or JPEG format supported. Minimum 2 documents required for {type === 'SUPPLIER' ? 'Supplier' : 'Vendor'} Node activation.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kycDocs.map(doc => (
                   <div key={doc.id} className={`p-5 rounded-3xl border-2 transition-all flex flex-col gap-4 ${documents[doc.id] ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}>
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${documents[doc.id] ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                               {documents[doc.id] ? <CheckCircle2 size={20}/> : <FileText size={20}/>}
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{doc.label}</p>
                               {doc.required && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Mandatory</span>}
                            </div>
                         </div>
                         {documents[doc.id] && !readOnly && (
                            <button onClick={() => removeDoc(doc.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                         )}
                      </div>
                      
                      {documents[doc.id] ? (
                         <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-emerald-100">
                            <Globe size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-800 truncate">{documents[doc.id]}</span>
                         </div>
                      ) : (
                         <button 
                            disabled={readOnly}
                            onClick={() => { setCurrentDocType(doc.id); fileInputRef.current?.click(); }}
                            className={`w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                         >
                            <Upload size={14}/> {readOnly ? 'No Document' : 'Upload Registry File'}
                         </button>
                      )}
                   </div>
                ))}
             </div>
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" disabled={readOnly} />
          </Card>
        </div>

        <div className="lg:col-span-4">
           <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[40px] p-8 sticky top-24 relative overflow-hidden group">
              <h3 className="text-xl font-black mb-8 border-b border-white/10 pb-4 flex items-center gap-3 uppercase tracking-tighter">
                <Scale size={24} className="text-indigo-400" /> Audit Ledger
              </h3>
              
              <div className="space-y-6 mb-10">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator Role</span>
                    <span className="text-sm font-bold text-indigo-400">{form.requestedRole}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trade Entity</span>
                    <span className="text-sm font-bold truncate">{form.businessName || '---'}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Documentation Status</span>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm font-bold">{Object.keys(documents).length} Files Synced</span>
                       {Object.keys(documents).length >= (type === 'SUPPLIER' ? 2 : 1) ? <CheckCircle2 size={16} className="text-emerald-400"/> : <Clock size={16} className="text-amber-400"/>}
                    </div>
                 </div>
              </div>

              <div className="p-5 bg-white/5 border border-white/10 rounded-3xl mb-10">
                 <p className="text-[11px] text-indigo-200 leading-relaxed font-medium italic">
                   "Information transmitted is verified against regional URA and URSB records. False declarations will result in node blacklist."
                 </p>
              </div>

              {!readOnly && (
                <Button 
                  onClick={handleSubmit} 
                  loading={submitting}
                  className="w-full h-16 bg-indigo-600 border-none shadow-2xl shadow-indigo-900/40 font-black uppercase text-xs tracking-widest rounded-2xl"
                >
                  Broadcast Dossier <ArrowRight size={18} className="ml-2"/>
                </Button>
              )}
              {readOnly && (
                <Button 
                  onClick={onComplete}
                  className="w-full h-16 bg-indigo-600 border-none shadow-2xl shadow-indigo-900/40 font-black uppercase text-xs tracking-widest rounded-2xl"
                >
                  Close Review <CheckCircle2 size={18} className="ml-2"/>
                </Button>
              )}
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
           </Card>
        </div>
      </div>
    </div>
  );
};
