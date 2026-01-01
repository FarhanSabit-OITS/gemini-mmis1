import React, { useState, useMemo } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, 
  History, Download, Plus, Smartphone, Landmark,
  DollarSign, ArrowRightLeft, Send, X, AlertCircle,
  Search, Filter, Calendar, FileText, Eye, CheckCircle2, Clock,
  ArrowUpDown, ChevronUp, ChevronDown, Hash, ShieldCheck, RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { PaymentGateway } from '../payments/PaymentGateway.tsx';
import { UserProfile, Transaction } from '../../types.ts';

interface WalletModuleProps {
  user: UserProfile;
}

type SortKey = 'date' | 'amount' | 'type';

export const WalletModule = ({ user }: WalletModuleProps) => {
  const [balance, setBalance] = useState(1250000);
  const [activeAction, setActiveAction] = useState<'NONE' | 'TOPUP' | 'TRANSFER' | 'WITHDRAW'>('NONE');
  const [showGateway, setShowGateway] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'MOMO' | 'BANK'>('MOMO');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TX-W001', date: '2024-05-20 10:30', amount: 500000, type: 'SALE_REVENUE', status: 'SUCCESS', method: 'MTN_MOMO', direction: 'IN', referenceId: 'REF-8821' },
    { id: 'TX-W002', date: '2024-05-19 14:15', amount: 150000, type: 'RENT', status: 'SUCCESS', method: 'CASH', direction: 'OUT', referenceId: 'REF-8822' },
    { id: 'TX-W003', date: '2024-05-18 09:00', amount: 250000, type: 'PAYOUT', status: 'PENDING', method: 'BANK', direction: 'OUT', referenceId: 'REF-8823' },
    { id: 'TX-W004', date: '2024-05-18 08:30', amount: 45000, type: 'SERVICE_CHARGE', status: 'SUCCESS', method: 'BANK', direction: 'OUT', referenceId: 'REF-8824' },
  ]);

  const handleTopUpSuccess = () => {
    const val = Number(amount);
    setBalance(prev => prev + val);
    setTransactions([
      { 
        id: 'TX-TOP-' + Math.floor(1000 + Math.random() * 9000), 
        date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
        amount: val, 
        type: 'SALE_REVENUE', 
        status: 'SUCCESS', 
        method: 'MTN_MOMO', 
        direction: 'IN' 
      },
      ...transactions
    ]);
    resetAction();
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (isNaN(val) || val <= 0) return;
    if (val > balance) return;
    
    setBalance(prev => prev - val);
    setTransactions([
      { 
        id: 'TX-TRF-' + Math.floor(1000 + Math.random() * 9000), 
        date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
        amount: val, 
        type: 'PAYOUT', 
        status: 'SUCCESS', 
        method: 'BANK', 
        direction: 'OUT' 
      },
      ...transactions
    ]);
    resetAction();
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (isNaN(val) || val <= 0 || val > balance) return;
    
    setBalance(prev => prev - val);
    setTransactions([
      { 
        id: 'TX-WDR-' + Math.floor(1000 + Math.random() * 9000), 
        date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
        amount: val, 
        type: 'WITHDRAWAL', 
        status: 'PENDING', 
        method: withdrawMethod === 'MOMO' ? 'MTN_MOMO' : 'BANK', 
        direction: 'OUT' 
      },
      ...transactions
    ]);
    resetAction();
  };

  const resetAction = () => {
    setActiveAction('NONE');
    setAmount('');
    setRecipient('');
    setAccountNumber('');
    setShowGateway(false);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(tx => {
      const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tx.method.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'ALL' || tx.type === filterType;
      
      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const txDate = new Date(tx.date).getTime();
        const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
        const end = dateRange.end ? new Date(dateRange.end).setHours(23,59,59) : Infinity;
        matchesDate = txDate >= start && txDate <= end;
      }

      const matchesMin = amountRange.min === '' || tx.amount >= Number(amountRange.min);
      const matchesMax = amountRange.max === '' || tx.amount <= Number(amountRange.max);

      return matchesSearch && matchesType && matchesDate && matchesMin && matchesMax;
    });

    result.sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];
      if (sortConfig.key === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, searchQuery, filterType, dateRange, amountRange, sortConfig]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {activeAction === 'TOPUP' && showGateway && (
        <PaymentGateway 
          amount={Number(amount)}
          itemDescription="Wallet Liquidity Sync"
          onSuccess={handleTopUpSuccess}
          onCancel={() => setShowGateway(false)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-indigo-50 dark:ring-indigo-950/20">
             <Wallet size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Node Wallet</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Digital liquidity and settlement ledger.</p>
           </div>
        </div>
        <Button variant="secondary" className="h-12 border-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest"><Download size={18}/> Statement</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-slate-900 text-white p-10 rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Node Balance</p>
              <p className="text-6xl font-black tracking-tighter mb-8 group-hover:scale-105 transition-transform origin-left duration-500">UGX {balance.toLocaleString()}</p>
              <div className="flex gap-3">
                 <Button onClick={() => { setActiveAction('TOPUP'); setAmount(''); }} className="flex-1 h-14 bg-indigo-600 border-none font-black uppercase text-xs rounded-2xl shadow-xl shadow-indigo-900/50">Top Up</Button>
                 <Button onClick={() => { setActiveAction('WITHDRAW'); setAmount(''); }} variant="secondary" className="flex-1 h-14 !bg-white/10 !text-white !border-white/10 font-black uppercase text-xs rounded-2xl">Extract</Button>
              </div>
           </div>
           <Database size={400} className="absolute -right-20 -bottom-20 opacity-5 text-white pointer-events-none" />
        </Card>

        <Card className="lg:col-span-2 p-10 rounded-[48px] shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             <div className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-[32px] border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-6 group cursor-pointer" onClick={() => setActiveAction('TRANSFER')}>
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform"><ArrowRightLeft size={28}/></div>
                <div>
                   <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Internal Protocol</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Peer Transfer</p>
                </div>
             </div>
             <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-6 group cursor-pointer">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><ShieldCheck size={28}/></div>
                <div>
                   <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Trust Ledger</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Verified Escrow</p>
                </div>
             </div>
          </div>
        </Card>
      </div>

      {activeAction === 'TOPUP' && (
         <Card className="max-w-md mx-auto p-10 rounded-[40px] animate-slide-up shadow-2xl border-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <button onClick={resetAction} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            <h3 className="text-2xl font-black mb-8 uppercase text-slate-900 tracking-tight">Initialize Top-up</h3>
            <Input label="Sync Amount (UGX) *" type="number" placeholder="0.00" value={amount} onChange={(e:any) => setAmount(e.target.value)} icon={DollarSign} />
            <Button onClick={() => setShowGateway(true)} className="w-full h-14 font-black uppercase text-xs bg-indigo-600 border-none shadow-xl rounded-2xl mt-4">Authorize Ledger Sync</Button>
         </Card>
      )}

      {activeAction === 'TRANSFER' && (
         <Card className="max-w-lg mx-auto p-10 rounded-[40px] animate-slide-up shadow-2xl border-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <button onClick={resetAction} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            <h3 className="text-2xl font-black mb-1 uppercase text-slate-900 tracking-tight">Peer Transfer Node</h3>
            <p className="text-xs text-slate-500 font-medium mb-8 uppercase tracking-widest">Instant 0-fee hub transfer</p>
            <form onSubmit={handleTransfer} className="space-y-6">
               <Input label="Recipient Node ID / Email *" placeholder="S-8801 or entity@domain.ug" value={recipient} onChange={(e:any) => setRecipient(e.target.value)} icon={Hash} />
               <Input label="Transfer Volume (UGX) *" type="number" placeholder="0.00" value={amount} onChange={(e:any) => setAmount(e.target.value)} icon={DollarSign} />
               <Button type="submit" className="w-full h-16 bg-slate-900 dark:bg-indigo-600 text-white border-none shadow-2xl font-black uppercase text-xs rounded-2xl">Broadcast Transfer <Send size={18} className="ml-2"/></Button>
            </form>
         </Card>
      )}

      {activeAction === 'WITHDRAW' && (
         <Card className="max-w-lg mx-auto p-10 rounded-[40px] animate-slide-up shadow-2xl border-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
            <button onClick={resetAction} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            <h3 className="text-2xl font-black mb-8 uppercase text-slate-900 tracking-tight">Extraction Protocol</h3>
            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
               <button onClick={() => setWithdrawMethod('MOMO')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${withdrawMethod === 'MOMO' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Mobile Money</button>
               <button onClick={() => setWithdrawMethod('BANK')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${withdrawMethod === 'BANK' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Bank Node</button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-6">
               <Input label={withdrawMethod === 'MOMO' ? "Subscriber Number *" : "Bank Account Number *"} icon={withdrawMethod === 'MOMO' ? Smartphone : Landmark} value={accountNumber} onChange={(e:any) => setAccountNumber(e.target.value)} />
               <Input label="Extraction Volume (UGX) *" type="number" placeholder="0.00" value={amount} onChange={(e:any) => setAmount(e.target.value)} icon={DollarSign} />
               <Button type="submit" className="w-full h-16 bg-amber-500 text-slate-900 border-none shadow-xl font-black uppercase text-xs rounded-2xl">Confirm Extraction</Button>
            </form>
         </Card>
      )}

      <Card className="rounded-[48px] p-0 overflow-hidden shadow-2xl border-none bg-white dark:bg-slate-900">
         <div className="p-10 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><History size={24}/></div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Transaction Ledger</h3>
                  <p className="text-xs text-slate-500 font-medium">Node liquidity flow and event history.</p>
               </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input placeholder="Search ledger..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none text-xs font-bold shadow-inner" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                     <th className="px-10 py-6 cursor-pointer" onClick={() => handleSort('date')}>Cycle <ArrowUpDown size={10} className="inline ml-1"/></th>
                     <th className="px-10 py-6">Descriptor</th>
                     <th className="px-10 py-6 cursor-pointer text-right" onClick={() => handleSort('amount')}>Volume <ArrowUpDown size={10} className="inline ml-1"/></th>
                     <th className="px-10 py-6 text-center">Protocol</th>
                     <th className="px-10 py-6 text-right">Integrity</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredTransactions.map(tx => (
                     <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer" onClick={() => setSelectedTx(tx)}>
                        <td className="px-10 py-8">
                           <p className="text-xs font-black text-slate-500 dark:text-slate-400">{tx.date.split(' ')[0]}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">{tx.date.split(' ')[1]}</p>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.direction === 'IN' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-red-50 text-red-600 dark:bg-red-950/30'}`}>
                                 {tx.direction === 'IN' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                              </div>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">{tx.type.replace('_', ' ')}</span>
                           </div>
                        </td>
                        <td className={`px-10 py-8 text-right font-black text-sm tracking-tighter ${tx.direction === 'IN' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                           {tx.direction === 'IN' ? '+' : '-'} {tx.amount.toLocaleString()} UGX
                        </td>
                        <td className="px-10 py-8 text-center text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-600 transition-colors">
                           {tx.method.replace('_', ' ')}
                        </td>
                        <td className="px-10 py-8 text-right">
                           <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                              tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 
                              'bg-red-50 text-red-600 border-red-100'
                           }`}>{tx.status}</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};

const Database = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);