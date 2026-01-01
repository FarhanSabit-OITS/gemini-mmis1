
import React, { useState } from 'react';
import { 
  Shield, Camera, ShieldAlert, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Smartphone, Eye, MapPin, 
  Clock, Lock, MoreVertical, Search, Bell, History, ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CameraNode {
  id: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'TRIGGERED';
  lastEvent: string;
  nodeType: 'CCTV' | 'DOOR' | 'ALARM';
}

export const SecurityModule = () => {
  const [nodes] = useState<CameraNode[]>([
    { id: 'CAM-01', location: 'Main Gate Delta', status: 'ONLINE', lastEvent: '2 mins ago', nodeType: 'CCTV' },
    { id: 'CAM-02', location: 'Wing B Aisle 12', status: 'TRIGGERED', lastEvent: '10 mins ago', nodeType: 'CCTV' },
    { id: 'CAM-03', location: 'Loading Dock Alpha', status: 'ONLINE', lastEvent: '45 mins ago', nodeType: 'CCTV' },
    { id: 'DOOR-01', location: 'Vault Room 1', status: 'ONLINE', lastEvent: '1 hour ago', nodeType: 'DOOR' },
    { id: 'CAM-04', location: 'Food Court Wing', status: 'OFFLINE', lastEvent: '4 hours ago', nodeType: 'CCTV' },
    { id: 'ALM-01', location: 'Perimeter West', status: 'ONLINE', lastEvent: '3 cycles ago', nodeType: 'ALARM' },
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl ring-4 ring-slate-100">
             <Shield size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Security Terminal</h2>
              <p className="text-slate-500 font-medium text-lg">Central surveillance & tactical node management.</p>
           </div>
        </div>
        <div className="flex gap-3">
           <Button variant="danger" className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-100 animate-pulse">
              <ShieldAlert size={18}/> Initiate Lockdown
           </Button>
           <Button className="shadow-2xl shadow-indigo-200 h-12 px-8 font-black uppercase tracking-widest text-xs">
              <Bell size={18} /> Alert Force
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 text-white p-6 rounded-[32px] border-none shadow-2xl relative overflow-hidden group">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Nodes</p>
           <div className="flex items-center justify-between mt-2">
              <p className="text-4xl font-black tracking-tighter">142</p>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                 <Eye size={24} />
              </div>
           </div>
           <Lock size={80} className="absolute -right-4 -bottom-4 opacity-5 text-white" />
        </Card>
        <Card className="p-6 rounded-[32px] border-l-8 border-l-emerald-500 shadow-xl">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Integrity</p>
           <div className="flex items-center justify-between mt-2">
              <p className="text-4xl font-black tracking-tighter text-slate-900">98.2%</p>
              <CheckCircle2 size={32} className="text-emerald-500" />
           </div>
        </Card>
        <Card className="p-6 rounded-[32px] border-l-8 border-l-red-500 shadow-xl">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Failures</p>
           <div className="flex items-center justify-between mt-2">
              <p className="text-4xl font-black tracking-tighter text-slate-900">03</p>
              <AlertTriangle size={32} className="text-red-500 animate-pulse" />
           </div>
        </Card>
        <Card className="p-6 rounded-[32px] border-l-8 border-l-amber-500 shadow-xl">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motion Alerts</p>
           <div className="flex items-center justify-between mt-2">
              <p className="text-4xl font-black tracking-tighter text-slate-900">12</p>
              <Zap size={32} className="text-amber-500" />
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* surviellance grid */}
        <div className="lg:col-span-2 space-y-6">
           <Card title="Live Node Surviellance Grid" className="rounded-[40px] shadow-2xl border-none p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {nodes.map(node => (
                    <div key={node.id} className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-white/5 group">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                       {node.status === 'OFFLINE' ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                             <ShieldAlert size={32} className="mb-2 opacity-20"/>
                             <span className="text-[8px] font-black uppercase tracking-widest">SIGNAL LOST</span>
                          </div>
                       ) : (
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                       )}
                       <div className="absolute top-3 left-3 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                             node.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                             node.status === 'TRIGGERED' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-slate-500'
                          }`}></div>
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">{node.id}</span>
                       </div>
                       <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <div>
                             <p className="text-[9px] font-black text-white uppercase truncate">{node.location}</p>
                             <p className="text-[7px] text-slate-400 font-bold uppercase">{node.lastEvent}</p>
                          </div>
                          <button className="p-1.5 bg-white/10 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Eye size={12}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card title="Tactical Event Log" className="rounded-[40px] shadow-xl p-0 overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <th className="px-8 py-5">Event Description</th>
                       <th className="px-8 py-5">Node ID</th>
                       <th className="px-8 py-5">Severity</th>
                       <th className="px-8 py-5 text-right">Time</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {[
                       { e: 'Motion Triggered', n: 'CAM-12', s: 'LOW', t: '12:45 PM' },
                       { e: 'Door Forced', n: 'DR-04', s: 'CRITICAL', t: '12:30 PM' },
                       { e: 'Maintenance Needed', n: 'CAM-08', s: 'MEDIUM', t: '11:15 AM' },
                    ].map((row, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 text-sm font-black text-slate-800">{row.e}</td>
                          <td className="px-8 py-5 text-xs font-mono text-indigo-600 font-bold">{row.n}</td>
                          <td className="px-8 py-5">
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                row.s === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                             }`}>{row.s}</span>
                          </td>
                          <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">{row.t}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </Card>
        </div>

        {/* side controls */}
        <div className="space-y-6">
           <Card className="rounded-[40px] shadow-xl p-8 bg-indigo-600 text-white border-none relative overflow-hidden group">
              <div className="relative z-10">
                 <h4 className="text-xl font-black mb-2 uppercase tracking-tight">Rapid Response</h4>
                 <p className="text-xs text-indigo-100 mb-8 font-medium">Instantly dispatch security or maintenance teams to verified node locations.</p>
                 <div className="space-y-3">
                    <Button variant="secondary" className="w-full !bg-white/10 !text-white !border-white/20 h-14 font-black uppercase text-xs">Dispatch Guard</Button>
                    <Button variant="secondary" className="w-full !bg-white/10 !text-white !border-white/20 h-14 font-black uppercase text-xs">Technical Support</Button>
                    <Button variant="secondary" className="w-full !bg-white !text-indigo-900 border-none h-14 font-black uppercase text-xs shadow-2xl">Manual Hub Override</Button>
                 </div>
              </div>
              <Shield size={120} className="absolute -right-4 -bottom-4 opacity-10"/>
           </Card>

           <Card title="Regional Status" className="rounded-[40px] shadow-xl">
              <div className="space-y-6">
                 {[
                    { l: 'Kampala Hub', s: 'SECURE', c: 'emerald' },
                    { l: 'Jinja Node', s: 'SECURE', c: 'emerald' },
                    { l: 'Mbarara Center', s: 'AUDIT', c: 'amber' },
                 ].map((hub, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                       <span className="text-xs font-black uppercase text-slate-600 tracking-widest">{hub.l}</span>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase bg-${hub.c}-50 text-${hub.c}-600 border border-${hub.c}-100`}>{hub.s}</span>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
