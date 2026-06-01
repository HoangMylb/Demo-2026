import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { CrashPage } from '../../pages/crash-page';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.assign(window.location.pathname + window.location.search + window.location.hash);
  };

  render() {
    if (this.state.hasError) {
      return <CrashPage onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
