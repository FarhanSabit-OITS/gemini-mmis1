
import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight, Smartphone, X, Zap, Globe } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PaymentGatewayProps {
  amount: number;
  itemDescription: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentGateway = ({ amount, itemDescription, onSuccess, onCancel }: PaymentGatewayProps) => {
  const [step, setStep] = useState<'DETAILS' | 'PROCESSING' | 'SUCCESS' | 'MOMO_PROMPT' | 'STRIPE_PROMPT' | 'PAYPAL_PROMPT'>('DETAILS');
  const [method, setMethod] = useState<'CARD' | 'MTN_MOMO' | 'AIRTEL_MONEY' | 'STRIPE' | 'PAYPAL'>('MTN_MOMO');
  const [phone, setPhone] = useState('');

  const handlePay = async () => {
    if (method === 'CARD' || method === 'STRIPE') {
       setStep('PROCESSING');
       await new Promise(r => setTimeout(r, 3000));
       setStep('SUCCESS');
       setTimeout(() => onSuccess(), 2000);
    } else if (method === 'PAYPAL') {
       setStep('PAYPAL_PROMPT');
    } else {
       setStep('MOMO_PROMPT');
    }
  };

  const finalizeExternal = async () => {
    setStep('PROCESSING');
    await new Promise(r => setTimeout(r, 4000));
    setStep('SUCCESS');
    setTimeout(() => onSuccess(), 2000);
  };

  if (step === 'PROCESSING') {
    return (
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[300] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-16 rounded-[48px] border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          <div className="w-20 h-20 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-xl"></div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Syncing Node</h2>
          <p className="text-slate-500 mt-3 font-medium px-8 italic">Communicating with {method.replace('_', ' ')} network switch... 0-latency bridge active.</p>
          <div className="mt-8 flex justify-center gap-2">
             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-75"></div>
             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'MOMO_PROMPT') {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-16 rounded-[48px] border-none shadow-2xl relative bg-white">
           <div className="absolute top-0 left-0 w-full h-2 bg-amber-400"></div>
           <div className="w-24 h-24 bg-slate-900 text-white rounded-[36px] flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
              <Smartphone size={48} className="text-amber-400" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 uppercase mb-4 tracking-tight">Check Your Phone</h2>
           <p className="text-slate-500 font-medium mb-10 px-10">We have dispatched an interactive <strong>USSD Prompt</strong> to <span className="text-indigo-600">{phone}</span>. Please input your PIN to authorize the transaction.</p>
           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10 mx-6 shadow-inner text-left space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Merchant:</span><span className="text-slate-800">MMIS UG HUB</span></div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Reference:</span><span className="text-slate-800">#HUB-{Math.floor(1000+Math.random()*9000)}</span></div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200"><span>Total:</span><span>UGX {amount.toLocaleString()}</span></div>
           </div>
           <Button onClick={finalizeExternal} className="w-full h-16 bg-amber-400 text-slate-900 border-none font-black uppercase text-xs rounded-3xl mx-auto block max-w-[280px] shadow-2xl shadow-amber-200">Authorized & PIN Entered</Button>
           <button onClick={() => setStep('DETAILS')} className="mt-8 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors tracking-widest">Resend Request</button>
        </Card>
      </div>
    );
  }

  if (step === 'PAYPAL_PROMPT') {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-16 rounded-[48px] border-none shadow-2xl relative bg-white">
           <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[36px] flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Globe size={48} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 uppercase mb-4 tracking-tight">PayPal Authorization</h2>
           <p className="text-slate-500 font-medium mb-10 px-10">A secure PayPal checkout window will initialize. Authenticate your global account to proceed.</p>
           <Button onClick={finalizeExternal} className="w-full h-16 bg-blue-600 text-white border-none font-black uppercase text-xs rounded-3xl mx-auto block max-w-[280px] shadow-2xl shadow-blue-200">Initialize PayPal Checkout</Button>
           <button onClick={() => setStep('DETAILS')} className="mt-8 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors tracking-widest">Cancel Checkout</button>
        </Card>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[300] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-16 rounded-[48px] border-none bg-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[36px] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Authorized</h2>
          <p className="text-slate-500 mt-2 font-medium">Digital ledger synchronized. Your dues are cleared.</p>
          <Zap size={200} className="absolute -right-20 -bottom-20 opacity-5 text-emerald-600" />
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in my-auto">
        <div className="lg:col-span-2">
          <Card className="bg-indigo-600 text-white h-full p-10 rounded-[48px] border-none shadow-2xl relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 mb-10 opacity-80 uppercase text-[10px] font-black tracking-[0.3em]">
              <ShieldCheck size={18} /> Secure Hub Switch
            </div>
            <h3 className="text-4xl font-black mb-2 tracking-tighter">{itemDescription}</h3>
            <p className="text-indigo-200 text-sm font-bold opacity-80 uppercase tracking-widest">Platform Escrow Node</p>
            
            <div className="mt-auto space-y-6 pt-12 border-t border-indigo-500">
              <div className="flex justify-between items-center opacity-80">
                <span className="text-xs font-black uppercase tracking-widest">Base Amount</span>
                <span className="font-mono text-xl">UGX {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center opacity-80">
                <span className="text-xs font-black uppercase tracking-widest">Global Fee</span>
                <span className="font-mono text-xl text-indigo-300">UGX 0.00</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-indigo-400">
                <span className="text-lg font-black uppercase">Total Due</span>
                <span className="text-4xl font-black tracking-tighter">UGX {amount.toLocaleString()}</span>
              </div>
            </div>
            <ShieldCheck size={300} className="absolute -right-16 -top-16 opacity-5 text-white" />
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full p-10 rounded-[48px] shadow-2xl border-none">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Settlement Node</h3>
               <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X/></button>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-10 overflow-x-auto pb-2">
              {[
                { id: 'MTN_MOMO', label: 'MOMO', icon: Smartphone, color: 'border-amber-400 text-amber-600 bg-amber-50' },
                { id: 'AIRTEL_MONEY', label: 'AIRTEL', icon: Smartphone, color: 'border-red-500 text-red-600 bg-red-50' },
                { id: 'CARD', label: 'CARD', icon: CreditCard, color: 'border-indigo-600 text-indigo-700 bg-indigo-50' },
                { id: 'STRIPE', label: 'STRIPE', icon: ShieldCheck, color: 'border-slate-900 text-slate-900 bg-slate-50' },
                { id: 'PAYPAL', label: 'PAYPAL', icon: Globe, color: 'border-blue-600 text-blue-600 bg-blue-50' },
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => setMethod(m.id as any)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group shrink-0 min-w-[80px] ${
                    method === m.id ? m.color + ' shadow-lg scale-105' : 'border-slate-50 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <m.icon size={24} className={method === m.id ? '' : 'group-hover:scale-110 transition-transform'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {method === 'CARD' || method === 'STRIPE' ? (
                <>
                  <Input label="Registry Cardholder" placeholder="JOHN DOE" icon={Lock} />
                  <Input label="Digital Passcode / Number" placeholder="**** **** **** ****" icon={CreditCard} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry Index" placeholder="MM/YY" />
                    <Input label="Secure CVV" placeholder="***" type="password" />
                  </div>
                </>
              ) : method === 'PAYPAL' ? (
                <div className="space-y-6 py-6 text-center">
                  <Globe size={48} className="mx-auto text-blue-600 opacity-20" />
                  <p className="text-xs text-slate-500 font-medium">Safe redirection to PayPal checkout system. Global currency conversion applied automatically.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-slide-up">
                   <div className="flex items-center gap-4 p-5 bg-slate-900 rounded-[28px] text-white">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === 'MTN_MOMO' ? 'bg-amber-400' : 'bg-red-50'}`}>
                         <Smartphone size={24}/>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regional Network</p>
                         <p className="text-sm font-bold">{method.replace('_', ' ')} Gateway</p>
                      </div>
                   </div>
                   <Input label="Subscriber Number *" placeholder="07xx xxxxxx" icon={Smartphone} value={phone} onChange={(e:any)=>setPhone(e.target.value)} />
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight px-1 italic">Note: A secure USSD push will be transmitted for PIN authorization.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl mt-10 flex gap-4 border border-slate-100 shadow-inner">
              <AlertCircle className="text-indigo-600 shrink-0 mt-1" size={20} />
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase">
                Your transaction is protected by 256-bit hub encryption. Regional tax nodes are automatically synced for compliance.
              </p>
            </div>

            <div className="flex gap-4 mt-12">
              <Button variant="secondary" className="flex-1 h-16 border-none !bg-slate-50 !text-slate-400 uppercase font-black text-xs rounded-2xl" onClick={onCancel}>Abort</Button>
              <Button className="flex-[2] h-16 bg-indigo-600 border-none shadow-2xl shadow-indigo-100 font-black uppercase text-xs rounded-2xl" onClick={handlePay}>
                Transmit Settlement <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
