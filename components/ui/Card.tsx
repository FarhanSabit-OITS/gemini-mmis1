
import React from 'react';

interface CardProps {
  // Fixed: Made children optional and added key to resolve TS errors in various components
  children?: React.ReactNode;
  title?: string;
  className?: string;
  key?: React.Key;
  // Added: Added onClick to CardProps to support interaction on card elements
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// Fixed: Destructured and applied onClick to the container div
export const Card = ({ children, title, className = '', onClick }: CardProps) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}
  >
    {title && <h3 className="text-lg font-semibold mb-4 text-slate-800">{title}</h3>}
    {children}
  </div>
);
