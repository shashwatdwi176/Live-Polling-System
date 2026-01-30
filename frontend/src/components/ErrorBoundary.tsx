import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          color: '#373737'
        }}>
          <span className="intervue-badge" style={{ background: '#FF3B30', marginBottom: '24px' }}>
            System Error
          </span>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#86868B', marginBottom: '24px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
