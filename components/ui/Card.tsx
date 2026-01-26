import React from 'react';

// Fixed: Explicitly extend React.HTMLAttributes to ensure className, children and standard div attributes are available.
// Explicitly added children and className to resolve TS errors where inference fails.
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ children, title, className = '', ...rest }: CardProps) => (
  <div 
    className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}
    {...rest}
  >
    {title && <h3 className="text-lg font-semibold mb-4 text-slate-800">{title}</h3>}
    {children}
  </div>
);