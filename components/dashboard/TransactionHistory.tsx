import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, DollarSign, Calendar, ArrowUpRight, 
  ArrowDownLeft, SlidersHorizontal, ChevronLeft, ChevronRight,
  ArrowUpDown, X, FileText, CheckCircle2, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserProfile, Transaction } from '../../types';

export const TransactionHistory = ({ user }: { user: UserProfile }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  /* Fix: Corrected transaction method values to match the 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK' | 'CASH' | 'CARD' enum */
  const [transactions] = useState<Transaction[]>([
    { id: 'TX-101', date: '2024-05-15 14:30', amount: 250000, type: 'RENT', status: 'SUCCESS', method: 'MTN_MOMO' },
    { id: 'TX-102', date: '2024-05-14 09:15', amount: 5000, type: 'SERVICE_CHARGE', status: 'SUCCESS', method: 'CASH' },
    { id: 'TX-103', date: '2024-05-12 11:20', amount: 1200000, type: 'WITHDRAWAL', status: 'PENDING', method: 'BANK' },
    { id: 'TX-104', date: '2024-05-10 16:45', amount: 450000, type: 'LICENSE', status: 'FAILED', method: 'CARD' },
    { id: 'TX-105', date: '2024-05-08 10:00', amount: 30000, type: 'SERVICE_CHARGE', status: 'SUCCESS', method: 'MTN_MOMO' },
    { id: 'TX-106', date: '2024-05-18 08:30', amount: 15000, type: 'GATE_FEE', status: 'PENDING', method: 'CASH' },
  ]);

  const handleSort = (key: keyof Transaction) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const processedTransactions = useMemo(() => {
    // 1. Filter
    let result = transactions.filter(tx => {
      const matchesSearch = tx.id.toLowerCase().includes(search.toLowerCase()) || tx.method.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'ALL' || tx.type === filterType;
      const matchesMin = amountRange.min === '' || tx.amount >= Number(amountRange.min);
      const matchesMax = amountRange.max === '' || tx.amount <= Number(amountRange.max);
      
      const matchesStart = dateRange.start === '' || tx.date >= dateRange.start;
      const matchesEnd = dateRange.end === '' || tx.date <= dateRange.end + ' 23:59';

      return matchesSearch && matchesType && matchesMin && matchesMax && matchesStart && matchesEnd;
    });

    // 2. Sort
    result.sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      // Handle numeric sorting for amounts
      if (sortConfig.key === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // Handle date sorting (simple string comparison works for ISO-like dates, or convert to Date)
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, search, filterType, amountRange, dateRange, sortConfig]);

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial History</h2>
          <p className="text-slate-500">Monitor all dues, payments, and withdrawals in real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="text-sm"><Download size={16}/> Export CSV</Button>
          <Button className="text-sm"><ArrowUpRight size={16}/> New Withdrawal</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="md:col-span-1 lg:col-span-2">
          <Input icon={Search} placeholder="Search TX ID or method..." value={search} onChange={(e:any) => setSearch(e.target.value)} />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-black text-white border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="ALL">All Types</option>
          <option value="RENT">Rent Payments</option>
          <option value="SERVICE_CHARGE">Service Charges</option>
          <option value="WITHDRAWAL">Withdrawals</option>
          <option value="LICENSE">License Fees</option>
          <option value="GATE_FEE">Gate Fees</option>
        </select>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar size={18} /> Date Range
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal size={18} /> More Filters
        </Button>
      </div>

      {/* Extended Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Min Amount (UGX)</label>
          <input type="number" placeholder="0" value={amountRange.min} onChange={(e) => setAmountRange({...amountRange, min: e.target.value})} className="w-full bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Max Amount (UGX)</label>
          <input type="number" placeholder="1M+" value={amountRange.max} onChange={(e) => setAmountRange({...amountRange, max: e.target.value})} className="w-full bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold" />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                <th className="px-4 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1">Transaction ID <ArrowUpDown size={12} className={sortConfig.key === 'id' ? 'text-indigo-600' : 'text-slate-300'}/></div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date & Time <ArrowUpDown size={12} className={sortConfig.key === 'date' ? 'text-indigo-600' : 'text-slate-300'}/></div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1">Type <ArrowUpDown size={12} className={sortConfig.key === 'type' ? 'text-indigo-600' : 'text-slate-300'}/></div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">Amount <ArrowUpDown size={12} className={sortConfig.key === 'amount' ? 'text-indigo-600' : 'text-slate-300'}/></div>
                </th>
                <th className="px-4 py-4">Method</th>
                <th className="px-4 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <ArrowUpDown size={12} className={sortConfig.key === 'status' ? 'text-indigo-600' : 'text-slate-300'}/></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {processedTransactions.map((tx) => (
                <tr 
                  key={tx.id} 
                  className={`transition-colors cursor-pointer group ${
                    tx.status === 'PENDING' ? 'bg-amber-50/60 hover:bg-amber-100/50' : 'hover:bg-slate-50/50'
                  }`}
                  onClick={() => setSelectedTx(tx)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {tx.status === 'PENDING' && <RefreshCw size={12} className="text-amber-500 animate-spin-slow"/>}
                      <span className="font-mono text-xs font-bold text-indigo-600 group-hover:underline">{tx.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">{tx.date}</td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded">{tx.type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 font-bold">
                      {tx.type === 'WITHDRAWAL' ? <ArrowUpRight size={14} className="text-red-500" /> : <ArrowDownLeft size={14} className="text-emerald-500" />}
                      <span className={tx.type === 'WITHDRAWAL' ? 'text-slate-900' : 'text-slate-900'}>UGX {tx.amount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600 font-medium">{tx.method.replace('_', ' ')}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1 w-fit ${
                      tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {tx.status === 'SUCCESS' && <CheckCircle2 size={10} />}
                      {tx.status === 'PENDING' && <Clock size={10} />}
                      {tx.status === 'FAILED' && <AlertCircle size={10} />}
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {processedTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">No transactions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 text-xs text-slate-500">
          <p>Showing {processedTransactions.length} of {transactions.length} entries</p>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-slate-100 rounded border border-slate-200 disabled:opacity-50"><ChevronLeft size={16}/></button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded font-bold">1</button>
            <button className="p-1.5 hover:bg-slate-100 rounded border border-slate-200 disabled:opacity-50"><ChevronRight size={16}/></button>
          </div>
        </div>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in">
           <Card className="w-full max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-2xl relative bg-white">
              <div className={`h-2 w-full ${
                selectedTx.status === 'SUCCESS' ? 'bg-emerald-500' : 
                selectedTx.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
              }`}></div>
              
              <button 
                onClick={() => setSelectedTx(null)} 
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 z-10"
              >
                <X size={20}/>
              </button>
              
              <div className="p-8 text-center border-b border-slate-50 bg-slate-50/30">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                    selectedTx.direction === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white'
                 }`}>
                    {selectedTx.type === 'WITHDRAWAL' || selectedTx.type === 'PAYOUT' ? <ArrowUpRight size={32}/> : <ArrowDownLeft size={32}/>}
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                    {selectedTx.direction === 'IN' ? '+' : '-'} UGX {selectedTx.amount.toLocaleString()}
                 </h3>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedTx.type.replace('_', ' ')}</p>
                 {selectedTx.status === 'PENDING' && (
                   <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                     <RefreshCw size={12} className="animate-spin"/> Processing
                   </div>
                 )}
              </div>

              <div className="p-8 space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       selectedTx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 
                       selectedTx.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>{selectedTx.status}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase">Transaction ID</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{selectedTx.id}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase">Date & Time</span>
                    <span className="text-sm font-bold text-slate-700">{selectedTx.date}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase">Method</span>
                    <span className="text-sm font-bold text-slate-700">{selectedTx.method.replace('_', ' ')}</span>
                 </div>
                 {selectedTx.referenceId && (
                   <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase">Reference</span>
                      <span className="text-sm font-bold text-slate-700">{selectedTx.referenceId}</span>
                   </div>
                 )}
              </div>

              <div className="p-6 bg-slate-50 flex gap-3">
                 <Button variant="secondary" className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border-slate-200">
                    <FileText size={14}/> Download Receipt
                 </Button>
                 <Button variant="secondary" className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:text-red-600 hover:border-red-200">
                    <AlertCircle size={14}/> Report Issue
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};