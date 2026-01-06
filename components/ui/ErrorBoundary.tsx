import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical System Failure:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Exception</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: '500' }}>
              The current module encountered an unhandled rendering cycle.
            </p>
            
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '1rem',
              marginBottom: '2rem',
              textAlign: 'left',
              border: '1px solid #f1f5f9'
            }}>
               <pre style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                 {this.state.error?.message || 'Unknown Protocol Error'}
               </pre>
            </div>

            <button 
              onClick={() => window.location.reload()} 
              style={{
                width: '100%',
                padding: '1.25rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontSize: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
              }}
            >
              Initialize Reboot
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
