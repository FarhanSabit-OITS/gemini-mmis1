
import React, { useState } from 'react';
import { Mail, Lock, User, Fingerprint, MessageSquare, Info, AlertCircle, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserProfile, Role } from '../../types';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';

interface AuthPageProps {
  onSuccess: (user: UserProfile) => void;
}

export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'MFA' | 'FORGOT' | 'VERIFY_EMAIL'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate server-side auth latency
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setMode('MFA');
  };

  const handleSignup = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setMode('VERIFY_EMAIL');
  };

  const handleMfaSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    // Mock User Object Construction based on Login/Signup data
    const mockUser: UserProfile = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0] || 'Operator',
      email: email || 'demo@mmis.ug',
      role: 'USER', // Default role is USER, they apply for others later
      isVerified: true,
      kycStatus: 'NONE',
      mfaEnabled: true,
      settings: {
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        notifications: {
          email: true,
          browser: true,
          sms: false
        }
      }
    };

    if (rememberMe) {
      localStorage.setItem('mmis_remembered_email', email);
    } else {
      localStorage.removeItem('mmis_remembered_email');
    }

    onSuccess(mockUser);
    setLoading(false);
  };

  const handleVerifyLinkClick = () => {
    // Simulating the user clicking the link in their email
    alert("Email Verified Successfully! Redirecting to Dashboard...");
    setMode('LOGIN'); 
    // In a real app, this would likely redirect to a route that handles the token validation
    // For this demo, we guide them back to login or auto-login
    handleLogin(); 
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative">
      <Header 
        user={null} 
        isSimplified={true}
        onLogoClick={() => setMode('LOGIN')}
      />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center justify-center gap-3">
              MMIS <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-2xl">HUB</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold uppercase text-[10px] tracking-[0.2em] opacity-60">Regional Logistics Intelligence</p>
          </div>

          <Card className="shadow-2xl border-none rounded-[40px] p-10 relative overflow-hidden bg-white dark:bg-slate-900">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            
            {mode === 'LOGIN' && (
              <>
                <h2 className="text-xl font-black mb-8 text-center text-slate-800 dark:text-white tracking-tight">Operator Authentication</h2>
                <Input 
                  label="Registry ID / Email" 
                  icon={Mail} 
                  placeholder="operator@mmis.ug" 
                  value={email} 
                  onChange={(e:any)=>setEmail(e.target.value)} 
                />
                <Input 
                  label="Master Key" 
                  type="password" 
                  icon={Lock} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e:any)=>setPassword(e.target.value)}
                />
                
                <div className="flex items-center justify-between mb-8 px-1">
                  <label className="flex items-center text-xs text-slate-500 dark:text-slate-400 cursor-pointer font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    /> 
                    Remember Me
                  </label>
                  <button onClick={() => setMode('FORGOT')} className="text-xs text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest hover:underline">Lost Access?</button>
                </div>

                <Button className="w-full h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 dark:shadow-none mb-8" onClick={handleLogin} loading={loading}>Authorize Terminal</Button>
                
                <div className="text-center space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    New entity? <button onClick={() => setMode('SIGNUP')} className="text-indigo-600 dark:text-indigo-400 hover:underline">Initialize Registration</button>
                  </p>
                  <button className="text-[9px] text-slate-300 hover:text-indigo-400 font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 mx-auto transition-colors">
                    <MessageSquare size={12} /> Contact Administrative Support
                  </button>
                </div>
              </>
            )}

            {mode === 'SIGNUP' && (
              <>
                <h2 className="text-xl font-black mb-8 text-center text-slate-800 dark:text-white tracking-tight">Create Entity Ledger</h2>
                <Input 
                  label="Legal Entity Name" 
                  icon={User} 
                  placeholder="e.g. Mukasa James" 
                  value={name}
                  onChange={(e:any)=>setName(e.target.value)}
                />
                <Input 
                  label="Registry Email" 
                  icon={Mail} 
                  placeholder="name@domain.com" 
                  value={email} 
                  onChange={(e:any)=>setEmail(e.target.value)} 
                />
                <Input 
                  label="Master Key Generation" 
                  type="password" 
                  icon={Lock} 
                  placeholder="Secure passphrase" 
                  value={password}
                  onChange={(e:any)=>setPassword(e.target.value)}
                />
                
                <Button className="w-full h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 dark:shadow-none mb-8" onClick={handleSignup} loading={loading}>Dispatch Credentials</Button>
                
                <div className="text-center pt-6 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Existing Node? <button onClick={() => setMode('LOGIN')} className="text-indigo-600 dark:text-indigo-400 hover:underline">Return to Terminal</button>
                  </p>
                </div>
              </>
            )}

            {mode === 'VERIFY_EMAIL' && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-indigo-50/50 dark:ring-indigo-900/20">
                  <Mail size={40} />
                </div>
                <h2 className="text-2xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">Verify Identity Node</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed px-4">
                  A verification beacon has been sent to <span className="text-indigo-600 dark:text-indigo-400 font-bold">{email}</span>. Please activate the link to initialize your ledger.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-4 flex gap-3 text-left mb-8">
                  <Info size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed font-bold uppercase tracking-tight">
                    Check Spam/Junk Nodes if signal not received within 60 seconds.
                  </p>
                </div>

                <Button 
                  className="w-full h-14 font-black uppercase tracking-widest text-xs shadow-xl" 
                  onClick={handleVerifyLinkClick}
                >
                  Simulate Link Activation <ArrowRight size={16} className="ml-2"/>
                </Button>
                
                <button onClick={() => setMode('LOGIN')} className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300">Back to Login</button>
              </div>
            )}

            {mode === 'MFA' && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-indigo-50/50 dark:ring-indigo-900/20">
                  <Fingerprint size={40} />
                </div>
                <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">Identity Sync</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-10 font-medium">Transmit the 6-digit MMIS Secure Key generated via your authenticator node or SMS.</p>
                <div className="flex gap-2 sm:gap-3 justify-center mb-10">
                  {mfaCode.map((digit, i) => (
                    <input 
                      key={i} 
                      maxLength={1} 
                      value={digit}
                      onChange={(e) => {
                        const newCode = [...mfaCode];
                        newCode[i] = e.target.value;
                        setMfaCode(newCode);
                        if(e.target.value && i < 5) {
                          const nextInput = document.getElementById(`mfa-${i+1}`);
                          nextInput?.focus();
                        }
                      }}
                      id={`mfa-${i}`}
                      autoFocus={i === 0}
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-black text-white border-2 border-slate-800 rounded-xl text-center font-black text-xl focus:border-indigo-600 outline-none transition-all shadow-xl" 
                    />
                  ))}
                </div>
                <Button className="w-full h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 dark:shadow-none" onClick={handleMfaSubmit} loading={loading}>Validate Registry</Button>
                <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth failure? <button className="text-indigo-600 dark:text-indigo-400 hover:underline">Use Recovery Ledger</button></p>
              </div>
            )}

            {mode === 'FORGOT' && (
              <>
                <h2 className="text-xl font-black mb-4 text-center text-slate-800 dark:text-white tracking-tight">Ledger Recovery</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-10 text-center font-medium leading-relaxed">System will dispatch a key rotation packet to your verified registry email address.</p>
                <Input label="Verified Email" icon={Mail} placeholder="operator@domain.ug" />
                <Button className="w-full h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 dark:shadow-none" onClick={() => { alert('Recovery packet dispatched!'); setMode('LOGIN'); }}>Send Rotation Link</Button>
                <div className="mt-10 text-center pt-6 border-t border-slate-50 dark:border-slate-800">
                  <button onClick={() => setMode('LOGIN')} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">Abort & Return</button>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
