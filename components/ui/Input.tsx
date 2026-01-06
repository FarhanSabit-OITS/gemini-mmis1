
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  icon?: LucideIcon;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  multiline?: boolean;
  required?: boolean;
  className?: string;
}

export const Input = ({ label, name, type = 'text', placeholder, icon: Icon, value, onChange, disabled, multiline, required, className = '' }: InputProps) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-black text-slate-800 uppercase tracking-widest mb-2 px-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10 transition-colors group-focus-within:text-indigo-400" />}
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-black text-white border-2 border-slate-800 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none placeholder:text-slate-500 text-sm font-bold disabled:opacity-50 resize-none shadow-xl`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-black text-white border-2 border-slate-800 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none placeholder:text-slate-500 text-sm font-bold disabled:opacity-50 shadow-xl`}
        />
      )}
    </div>
  </div>
);
