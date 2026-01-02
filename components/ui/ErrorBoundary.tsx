import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component to catch rendering errors in the component tree.
 * Explicitly extends React.Component with Props and State generics to fix 
 * property access issues where 'state' and 'props' are not recognized.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  // Proper constructor and state initialization to resolve property access errors
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  // Mandatory static method for Error Boundaries
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical System Failure:", error, errorInfo);
  }

  public render() {
    // Fixed: Access state via 'this' after ensuring inheritance from React.Component
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
          <Card className="max-w-md w-full text-center p-12 rounded-[40px] shadow-2xl border-none relative overflow-hidden bg-white dark:bg-slate-900">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl">
              <ShieldAlert size={48} />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">System Anomaly</h1>
            
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">
              The application encountered a critical rendering exception. Our engineers have been notified via the audit log.
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700 text-left">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Error Trace</p>
               <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                 {/* Fixed: Safely access error message from inherited state */}
                 {this.state.error?.message || 'Unknown Error'}
               </p>
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              className="w-full h-16 bg-red-600 hover:bg-red-700 text-white border-none shadow-2xl shadow-red-200 dark:shadow-none font-black uppercase text-xs rounded-2xl tracking-widest"
            >
              <RefreshCw size={18} className="mr-2" /> Reboot System
            </Button>
          </Card>
        </div>
      );
    }

    // Fixed: Correctly return children from inherited props
    return this.props.children;
  }
}
