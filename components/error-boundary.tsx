"use client";

import React, { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches React errors and displays a fallback UI.
 * Prevents entire application crash from unhandled component errors.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-background px-4"
          role="alert"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-accent mb-4">Something went wrong</h1>
            <p className="text-foreground/60 mb-8 max-w-md">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-8 text-left bg-card p-4 rounded text-sm text-foreground/70 max-w-2xl mx-auto">
                <summary className="cursor-pointer font-mono text-accent mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="overflow-auto font-mono text-xs whitespace-pre-wrap break-words">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
