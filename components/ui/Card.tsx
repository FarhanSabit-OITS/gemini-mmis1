
import React from 'react';

// Fixed: Extended HTMLAttributes to support standard attributes like role, aria-labelledby, etc.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

// Fixed: Destructured and applied rest props (like role, aria-*) and onClick to the container div
export const Card = ({ children, title, className = '', onClick, ...rest }: CardProps) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}
    {...rest}
  >
    {title && <h3 className="text-lg font-semibold mb-4 text-slate-800">{title}</h3>}
    {children}
  </div>
);
