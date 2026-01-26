import React, { HTMLAttributes } from 'react';

// Explicitly extend HTMLAttributes to ensure className, children, role, onClick and standard div attributes are available.
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', ...rest }) => (
  <div 
    className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}
    {...rest}
  >
    {title && <h3 className="text-lg font-semibold mb-4 text-slate-800">{title}</h3>}
    {children}
  </div>
);