
import React, { useState, useMemo, useRef } from 'react';
import { 
  MessageSquare, Plus, Search, Filter, Clock, AlertCircle, 
  CheckCircle2, X, Send, MoreVertical, Wrench, Package,
  Zap, ChevronRight, Info, ShieldAlert, User, Building,
  Camera, FileText, Sparkles, UserCheck, ShieldCheck,
  ArrowRight, LayoutGrid, ClipboardList, RefreshCw, ChevronDown,
  Image as ImageIcon, Trash2, Smartphone
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Ticket, UserProfile } from '../../types';

export const TicketingSystem = ({ user }: { user: UserProfile }) => {
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MARKET_ADMIN';
  
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'TIC-1022', title: 'CCTV Blindspot - Wing B', description: 'The camera at Wing B, Stall 12 is facing down and not recording the aisle.', context: 'ASSET', priority: 'HIGH', status: 'IN_PROGRESS', creatorId: 'U-001', creatorName: 'Mukasa (Security)', createdAt: '2024-05-18 10:30', assetType: 'CCTV', assignedToId: 'ADM-01', assignedToName: 'James Mukasa (Admin)', attachmentUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'TIC-1023', title: 'Bulb Replacement Required', description: 'Main entrance gate light is flickering.', context: 'ASSET', priority: 'LOW', status: 'OPEN', creatorId: 'U-002', creatorName: 'Jane (Staff)', createdAt: '2024-05-18 11:45', assetType: 'BULB' },
  ]);

  const [search, setSearch] = useState('');
  const [filterContext, setFilterContext] = useState<string>('ALL');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    context: 'SUPPORT' as Ticket['context'],
    priority: 'MEDIUM' as Ticket['priority'],
    assetType: 'GENERAL'
  });

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapturedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTicket = () => {
    const newTicket: Ticket = {
      id: 'TIC-' + Math.floor(1000 + Math.random() * 9000),
      title: form.title,
      description: form.description,
      context: form.context,
      priority: form.priority,
      status: 'OPEN',
      creatorId: user.id,
      creatorName: user.name,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      attachmentUrl: capturedImage || undefined
    };
    setTickets([newTicket, ...tickets]);
    setShowNewTicketModal(false);
    setForm({ title: '', description: '', context: 'SUPPORT', priority: 'MEDIUM', assetType: 'GENERAL' });
    setCapturedImage(null);
  };

  const getAiInsights = async (ticket: Ticket) => {
    setLoadingAi(true);
    setAiSummary('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this market support ticket. ${ticket.attachmentUrl ? 'There is a photo attached for visual evidence.' : ''} Ticket: ${ticket.title} - ${ticket.description}`
      });
      setAiSummary(response.text || 'Analysis node complete. Manual verification required.');
    } catch (e) {
      setAiSummary('AI insights temporarily disconnected.');
    }
    setLoadingAi(false);
  };

  const contextIcons = {
    SUPPORT: <MessageSquare className="text-indigo-600" size={18} />,
    ASSET: <Wrench className="text-amber-600" size={18} />,
    SUPPLY: <Package className="text-emerald-600" size={18} />,
    COMPLAINT: <ShieldAlert className="text-red-600" size={18} />
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl ring-4 ring-slate-100 shrink-0">
             <MessageSquare size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Case Registry</h2>
              <p className="text-slate-50 font-medium text-lg bg-black px-3 py-1 rounded-xl">Terminal: SUPPORT-SYNC</p>
           </div>
        </div>
        <Button onClick={() => setShowNewTicketModal(true)} className="shadow-2xl shadow-indigo-200 h-14 px-8 font-black uppercase tracking-widest text-xs">
          <Camera size={18} /> Field Incident Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
           <Input icon={Search} placeholder="Filter cases via keywords or ID..." value={search} onChange={(e:any) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select 
            value={filterContext}
            onChange={(e) => setFilterContext(e.target.value)}
            className="w-full h-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer"
          >
            <option value="ALL">All Flows</option>
            <option value="ASSET">Maintenance</option>
            <option value="COMPLAINT">Complaints</option>
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map(ticket => (
          <Card 
            key={ticket.id} 
            onClick={() => { setActiveTicket(ticket); getAiInsights(ticket); }}
            className="group hover:shadow-2xl transition-all cursor-pointer border-slate-100 p-0 rounded-[32px] overflow-hidden"
          >
             {ticket.attachmentUrl && (
               <div className="h-40 overflow-hidden relative">
                 <img src={ticket.attachmentUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Incident Evidence" />
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 border border-white/20">
                   <Camera size={10}/> Visual Node Attachment
                 </div>
               </div>
             )}
             <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-mono">{ticket.id}</span>
                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                 }`}>{ticket.status}</span>
               </div>
               <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2 line-clamp-1">{ticket.title}</h4>
               <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2">{ticket.description}</p>
               <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-2">
                   {contextIcons[ticket.context]}
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.context}</span>
                 </div>
                 <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                   {ticket.creatorName.charAt(0)}
                 </div>
               </div>
             </div>
          </Card>
        ))}
      </div>

      {activeTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-end animate-fade-in">
           <Card className="w-full max-w-2xl h-full shadow-2xl border-none rounded-none p-12 relative bg-white overflow-y-auto custom-scrollbar flex flex-col">
              <button onClick={() => setActiveTicket(null)} className="absolute top-10 right-10 p-3 hover:bg-slate-100 rounded-full transition-all shrink-0"><X size={32} className="text-slate-400"/></button>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-8">
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{activeTicket.id}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">{activeTicket.title}</h3>

                {activeTicket.attachmentUrl && (
                  <div className="mb-10 rounded-[32px] overflow-hidden shadow-2xl border-4 border-slate-100">
                    <img src={activeTicket.attachmentUrl} className="w-full" alt="Full Evidence" />
                  </div>
                )}

                <div className="mb-10 bg-indigo-600 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                   <div className="flex items-center gap-2 mb-4 relative z-10">
                      <Sparkles size={20} className="text-indigo-200" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">AI Diagnostic Triage</span>
                   </div>
                   <p className="text-sm font-medium leading-relaxed italic relative z-10">
                      {loadingAi ? 'Synthesizing captured imagery and event context...' : aiSummary}
                   </p>
                </div>

                <div className="mb-10">
                   <h4 className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-4 flex items-center gap-2 px-1"><Info size={14} className="text-indigo-400"/> Operational Narrative</h4>
                   <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 text-slate-600 text-sm leading-relaxed font-medium">
                      {activeTicket.description}
                   </div>
                </div>
              </div>

              <div className="mt-auto pt-10 border-t border-slate-100 flex gap-4">
                 <Button variant="secondary" onClick={() => setActiveTicket(null)} className="flex-1 h-14 font-black uppercase text-xs">Dismiss</Button>
                 {isAdmin && <Button className="flex-[2] h-14 bg-indigo-600 border-none shadow-xl font-black uppercase text-xs text-white">Resolve & Sync</Button>}
              </div>
           </Card>
        </div>
      )}

      {showNewTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
           <Card className="w-full max-w-xl shadow-2xl border-none rounded-[40px] p-10 relative bg-white overflow-hidden my-auto">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Raise Concern</h3>
                 <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-slate-600"><X size={28} /></button>
              </div>

              <div className="space-y-6">
                 {capturedImage ? (
                   <div className="relative rounded-[32px] overflow-hidden border-2 border-indigo-600 shadow-xl h-48 group">
                     <img src={capturedImage} className="w-full h-full object-cover" alt="Captured Evidence" />
                     <button onClick={() => setCapturedImage(null)} className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                   </div>
                 ) : (
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50 flex flex-col items-center justify-center gap-3 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                   >
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all"><Camera size={28}/></div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capture Asset Imagery</p>
                     <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageCapture} />
                   </button>
                 )}

                 <Input label="Summary Headline *" placeholder="e.g. Fan Failure - Level 1" value={form.title} onChange={(e:any)=>setForm({...form, title: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Flow</label>
                       <select value={form.context} onChange={(e) => setForm({...form, context: e.target.value as any})} className="bg-black text-white border-2 border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold focus:border-indigo-600 outline-none">
                         <option value="SUPPORT">Support</option>
                         <option value="ASSET">Maintenance</option>
                         <option value="COMPLAINT">Grievance</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Urgency</label>
                       <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value as any})} className="bg-black text-white border-2 border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold focus:border-indigo-600 outline-none">
                         <option value="LOW">Low</option>
                         <option value="MEDIUM">Medium</option>
                         <option value="HIGH">High</option>
                         <option value="CRITICAL">Critical</option>
                       </select>
                    </div>
                 </div>
                 <Input label="Technical Context" multiline placeholder="Specific stall # or component ID..." value={form.description} onChange={(e:any)=>setForm({...form, description: e.target.value})} />

                 <div className="flex gap-4 pt-4">
                    <Button variant="secondary" onClick={() => setShowNewTicketModal(false)} className="flex-1 h-14 font-black uppercase text-[10px]">Discard</Button>
                    <Button onClick={handleCreateTicket} className="flex-[2] h-14 bg-indigo-600 border-none shadow-xl font-black uppercase text-[10px] text-white">Broadcast Request</Button>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};
