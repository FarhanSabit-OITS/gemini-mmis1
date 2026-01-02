import React, { useState } from 'react';
import { Bell, Check, Trash2, Clock, Info, AlertTriangle, Package, Shield, Settings, Zap, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'order' | 'security';
  read: boolean;
}

export const NotificationCenter = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Order Dispatched', message: 'Fulfillment manifest ORD-8821 synced to Jinja Hub.', time: '2 mins ago', type: 'order', read: false },
    { id: '2', title: 'Registry Sync Success', message: 'Vendor "EcoShop" KYC dossier approved.', time: '1 hour ago', type: 'success', read: false },
    { id: '3', title: 'Node Surveillance Alert', message: 'Intermittent signal loss at Gate Delta-7.', time: '4 hours ago', type: 'security', read: true },
    { id: '4', title: 'System Patch v2.6.1', message: 'Mandatory kernel update scheduled at 02:00 UTC.', time: 'Yesterday', type: 'info', read: true },
    { id: '5', title: 'Low Fuel Reserve', message: 'Bridge Logistics vehicle #4 requires refueling.', time: 'Yesterday', type: 'warning', read: true },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl"><Package size={18} /></div>;
      case 'warning': return <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-xl"><AlertTriangle size={18} /></div>;
      case 'success': return <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl"><Check size={18} /></div>;
      case 'security': return <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-xl"><Shield size={18} /></div>;
      default: return <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl"><Zap size={18} /></div>;
    }
  };

  return (
    <div className="absolute right-0 mt-4 w-80 md:w-[450px] glass rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 z-[100] overflow-hidden animate-slide-up ring-4 ring-black/5">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">Event Stream</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{notifications.filter(n => !n.read).length} Unread Pulses</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={markAllRead} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors" title="Mark All Read">
              <CheckCircle2 size={18} />
           </button>
           <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <Settings size={18} />
           </button>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            <Bell className="mx-auto mb-4 opacity-20" size={64} />
            <p className="text-sm font-bold uppercase tracking-widest">Registry Zero: No Alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markRead(n.id)}
                className={`p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex gap-4 relative group ${!n.read ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}
              >
                <div className="shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-black tracking-tight dark:text-white truncate pr-4 ${n.read ? 'opacity-70' : ''}`}>{n.title}</h4>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1 shrink-0 uppercase tracking-tighter"><Clock size={10} /> {n.time}</span>
                  </div>
                  <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 ${n.read ? 'opacity-60' : ''}`}>{n.message}</p>
                  <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">Mark Synced</button>}
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Purge</button>
                  </div>
                </div>
                {!n.read && <div className="absolute top-6 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_#4f46e5]"></div>}
              </div>
            ))}
          </div>
        )
      }
      </div>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center">
        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] py-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">Global Activity Ledger</Button>
      </div>
    </div>
  );
};