import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('应用发生未捕获错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-stack" style={{ padding: '32px' }}>
          <div className="panel">
            <h2 className="section-title">页面出错了</h2>
            <p className="section-description">
              应用遇到了一个意外错误，请尝试刷新页面。
            </p>
            <p className="form-error">
              {this.state.error?.message ?? '未知错误'}
            </p>
            <button
              className="button button-primary inline-link-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
