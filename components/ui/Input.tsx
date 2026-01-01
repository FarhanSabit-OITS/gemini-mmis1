
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
  labelPosition?: 'above' | 'left';
  error?: string;
}

export const Input = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  value, 
  onChange, 
  disabled, 
  multiline, 
  required, 
  className = '',
  labelPosition = 'above',
  error 
}: InputProps) => {
  const containerClass = labelPosition === 'left' ? 'flex flex-col sm:flex-row sm:items-center gap-4' : 'flex flex-col gap-1';
  const labelClass = labelPosition === 'left' ? 'sm:w-1/3 shrink-0 mb-0' : 'w-full mb-1';

  return (
    <div className={`mb-4 ${className}`}>
      <div className={containerClass}>
        {label && (
          <label className={`block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest px-1 ${labelClass}`}>
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative group flex-1">
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
              className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-black text-white border-2 ${error ? 'border-red-500' : 'border-slate-800'} rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none placeholder:text-slate-500 text-sm font-bold disabled:opacity-50 resize-none shadow-xl`}
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
              className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-black text-white border-2 ${error ? 'border-red-500' : 'border-slate-800'} rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none placeholder:text-slate-500 text-sm font-bold disabled:opacity-50 shadow-xl`}
            />
          )}
        </div>
      </div>
      {error && <p className="text-[10px] text-red-500 font-black uppercase mt-2 px-1 tracking-widest animate-fade-in">{error}</p>}
    </div>
  );
};
