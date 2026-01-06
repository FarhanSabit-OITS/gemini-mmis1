
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
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
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Anomaly</h1>
            
            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.5' }}>
              The application encountered a critical rendering exception.
            </p>
            
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'left',
              overflowX: 'auto',
              border: '1px solid #e2e8f0'
            }}>
               <p style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Error Trace</p>
               <pre style={{ margin: 0, fontSize: '0.75rem', color: '#ef4444', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                 {this.state.error?.message || 'Unknown Error'}
               </pre>
            </div>

            <button 
              onClick={() => window.location.reload()} 
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '0.75rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
