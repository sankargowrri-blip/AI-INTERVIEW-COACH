import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optional label shown in the error UI */
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches any uncaught React render/lifecycle error inside
 * its subtree and shows a graceful fallback instead of a blank white page.
 *
 * Usage:
 *   <ErrorBoundary context="Live Interview">
 *     <LiveInterviewPage />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in every environment so developers can see it
    console.error('[ErrorBoundary]', this.props.context ?? 'Component', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;
    const context = this.props.context ?? 'this page';

    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
        <div className="text-center max-w-lg w-full">
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            Something went wrong
          </h1>
          <p className="text-surface-400 text-sm mb-6">
            An unexpected error occurred while loading {context}.
            Your interview progress has not been lost — please try again.
          </p>

          {/* Show technical detail only in development */}
          {isDev && this.state.error && (
            <div className="text-left bg-surface-900 border border-surface-700 rounded-xl p-4 mb-6 overflow-auto max-h-40">
              <p className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>
            <a
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-surface-700 hover:border-surface-500 text-surface-300 hover:text-white text-sm font-medium transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
