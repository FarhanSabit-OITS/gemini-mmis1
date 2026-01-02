
import React, { useState } from 'react';
import { User, Mail, Lock, Camera, Shield, Smartphone, Globe, Save, AlertTriangle, Bell, CheckCircle2, UserCheck, Briefcase, Truck, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserProfile, Role } from '../../types';
import { KYCModule } from './KYCModule';
import { AdminApplicationForm } from './AdminApplicationForm';

interface ProfileSettingsProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

export const ProfileSettings = ({ user, setUser }: ProfileSettingsProps) => {
  const [activeSection, setActiveSection] = useState<'PROFILE' | 'ROLES' | 'SECURITY' | 'PREFERENCES'>('PROFILE');
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // Inventory Thresholds
    lowStockThreshold: user.settings?.lowStockThreshold || 10,
    criticalStockThreshold: user.settings?.criticalStockThreshold || 5,
    // Notification preferences
    emailNotifications: user.settings?.notifications?.email ?? true,
    browserNotifications: user.settings?.notifications?.browser ?? true,
    smsNotifications: user.settings?.notifications?.sms ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Application State
  const [applicationType, setApplicationType] = useState<'VENDOR' | 'SUPPLIER' | 'MARKET_ADMIN' | null>(null);

  const handleUpdateSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    await new Promise(r => setTimeout(r, 1200));
    
    setUser({ 
      ...user, 
      name: formData.name, 
      email: formData.email,
      settings: {
        lowStockThreshold: Number(formData.lowStockThreshold),
        criticalStockThreshold: Number(formData.criticalStockThreshold),
        notifications: {
          email: formData.emailNotifications,
          browser: formData.browserNotifications,
          sms: formData.smsNotifications
        }
      }
    });
    
    setLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleKYCComplete = () => {
    setApplicationType(null);
    setUser({ ...user, kycStatus: 'PENDING', appliedRole: applicationType || undefined });
    alert("Application Transmitted: Your dossier is now pending administrative review.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveSection('PROFILE')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'PROFILE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
          >
            <User size={18} /> My Profile
          </button>
          <button 
            onClick={() => setActiveSection('ROLES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'ROLES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
          >
            <UserCheck size={18} /> Identity & Roles
          </button>
          <button 
            onClick={() => setActiveSection('SECURITY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'SECURITY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
          >
            <Shield size={18} /> Security & Auth
          </button>
          <button 
            onClick={() => setActiveSection('PREFERENCES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'PREFERENCES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
          >
            <Globe size={18} /> System & Alerts
          </button>
        </div>

        <div className="flex-1 space-y-6">
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-slide-down">
              <CheckCircle2 size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Configuration Synced Successfully</span>
            </div>
          )}

          {activeSection === 'PROFILE' && (
            <Card title="Public Profile Registry">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="relative group w-32 h-32">
                  <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-4xl font-black text-slate-400 overflow-hidden">
                    {user.name.charAt(0)}
                  </div>
                  <button className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                    <Camera size={24} />
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  <Input label="Operational Name" icon={User} value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
                  <Input label="Official Email Address" icon={Mail} value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                <Button onClick={handleUpdateSettings} loading={loading} className="px-8 font-black uppercase tracking-widest text-xs h-12 shadow-lg shadow-indigo-100">
                   <Save size={18}/> Update Registry
                </Button>
              </div>
            </Card>
          )}

          {activeSection === 'ROLES' && (
            <div className="space-y-6">
              {applicationType ? (
                <div className="animate-fade-in">
                  <button onClick={() => setApplicationType(null)} className="mb-6 flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowRight size={14} className="rotate-180"/> Back to Role Selection
                  </button>
                  {applicationType === 'MARKET_ADMIN' ? (
                    <AdminApplicationForm userEmail={user.email} onComplete={handleKYCComplete} />
                  ) : (
                    <KYCModule 
                      type={applicationType} 
                      userEmail={user.email} 
                      onComplete={handleKYCComplete} 
                    />
                  )}
                </div>
              ) : (
                <>
                  <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Current Authorization</p>
                        <h3 className="text-3xl font-black tracking-tighter uppercase">{user.role}</h3>
                        <div className="flex items-center gap-2 mt-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            user.kycStatus === 'APPROVED' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                            user.kycStatus === 'PENDING' || user.kycStatus === 'SUBMITTED' ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                            'bg-slate-700 border-slate-600 text-slate-400'
                          }`}>
                            KYC: {user.kycStatus}
                          </span>
                        </div>
                      </div>
                      <ShieldCheck size={100} className="text-white opacity-10" />
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Available Upgrades</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <button 
                        onClick={() => setApplicationType('VENDOR')}
                        disabled={user.role === 'VENDOR' || user.kycStatus === 'PENDING'}
                        className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Briefcase size={24}/>
                        </div>
                        <h5 className="font-black text-slate-900 dark:text-white mb-1">Vendor Node</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Establish a retail or wholesale presence. Manage inventory and orders.</p>
                        <div className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1">
                          Apply Now <ArrowRight size={12}/>
                        </div>
                      </button>

                      <button 
                        onClick={() => setApplicationType('SUPPLIER')}
                        disabled={user.role === 'SUPPLIER' || user.kycStatus === 'PENDING'}
                        className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Truck size={24}/>
                        </div>
                        <h5 className="font-black text-slate-900 dark:text-white mb-1">Supplier Hub</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Bulk distribution logistics. Access bridge network and large-scale RFQs.</p>
                        <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest flex items-center gap-1">
                          Apply Now <ArrowRight size={12}/>
                        </div>
                      </button>

                      <button 
                        onClick={() => setApplicationType('MARKET_ADMIN')}
                        disabled={user.role === 'MARKET_ADMIN' || user.kycStatus === 'PENDING'}
                        className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-amber-600 dark:hover:border-amber-500 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <ShieldAlert size={24}/>
                        </div>
                        <h5 className="font-black text-slate-900 dark:text-white mb-1">Market Admin</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">City-level oversight. Requires official domain verification.</p>
                        <div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest flex items-center gap-1">
                          Apply Now <ArrowRight size={12}/>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === 'SECURITY' && (
            <div className="space-y-6">
              <Card title="Session Access Protocol">
                <div className="space-y-4">
                  <Input type="password" label="Current Master Key" placeholder="••••••••" icon={Lock} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input type="password" label="New Master Key" placeholder="••••••••" icon={Lock} />
                    <Input type="password" label="Confirm New Key" placeholder="••••••••" icon={Lock} />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <Button variant="secondary" className="px-8 font-black uppercase tracking-widest text-xs h-12">Rotate Access Key</Button>
                </div>
              </Card>

              <Card title="Multi-Factor Authentication (MFA)">
                <div className="flex items-center justify-between p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-900 dark:text-emerald-400 text-sm tracking-tight uppercase">MFA Node Active</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Session integrity is verified via biometrics or secure token.</p>
                    </div>
                  </div>
                  <Button variant="danger" className="font-black uppercase tracking-widest text-[10px] h-10 px-6">Deactivate</Button>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'PREFERENCES' && (
             <div className="space-y-6">
               <Card title="Inventory Oversight Thresholds">
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed max-w-lg">
                   Define the stock level indices that trigger automated system alerts. These parameters calibrate your real-time oversight dashboards.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">
                        <AlertTriangle size={14} className="text-amber-500" /> Low Stock Parameter
                      </label>
                      <input 
                        type="number" 
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({...formData, lowStockThreshold: Number(e.target.value)})}
                        className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-4 focus:border-indigo-600 outline-none font-bold shadow-xl text-lg tracking-tight"
                      />
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter px-1">Soft warning triggered at this count.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">
                        <AlertTriangle size={14} className="text-red-500" /> Critical Stock Parameter
                      </label>
                      <input 
                        type="number" 
                        value={formData.criticalStockThreshold}
                        onChange={(e) => setFormData({...formData, criticalStockThreshold: Number(e.target.value)})}
                        className="w-full bg-black text-white border-2 border-slate-800 rounded-2xl px-5 py-4 focus:border-indigo-600 outline-none font-bold shadow-xl text-lg tracking-tight"
                      />
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter px-1">Hard deficit alert triggered at this count.</p>
                    </div>
                 </div>
               </Card>

               <Card title="Dispatch Configuration">
                 <div className="space-y-2">
                   {[
                     { id: 'emailNotifications', label: 'Electronic Mail Dispatch', desc: 'Summary ledgers, stock alerts, and automated invoicing.', icon: Mail },
                     { id: 'browserNotifications', label: 'Browser Event Stream', desc: 'Real-time UI popups for inventory cycles and gate activity.', icon: Bell },
                     { id: 'smsNotifications', label: 'SMS Carrier Dispatch', desc: 'Critical system failures and emergency auth requests.', icon: Smartphone },
                   ].map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400">
                          <pref.icon size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{pref.label}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{pref.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, [pref.id]: !formData[pref.id as keyof typeof formData]})}
                        className={`w-12 h-6 rounded-full transition-all relative ${formData[pref.id as keyof typeof formData] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData[pref.id as keyof typeof formData] ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                   ))}
                 </div>
               </Card>
               
               <div className="flex justify-end pt-4">
                 <Button onClick={handleUpdateSettings} loading={loading} className="px-12 h-14 shadow-2xl shadow-indigo-100 font-black uppercase text-xs tracking-widest">
                    Sync Preferences
                 </Button>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
