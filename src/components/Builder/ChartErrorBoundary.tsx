import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ChartErrorBoundaryProps {
  chartTitle: string;
  resetKey: string;
  children: ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

export class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  public declare readonly props: Readonly<ChartErrorBoundaryProps>;
  public declare setState: (state: Partial<ChartErrorBoundaryState>) => void;
  public declare readonly props: Readonly<ChartErrorBoundaryProps>;
  public declare setState: (state: Partial<ChartErrorBoundaryState>) => void;
  public state: ChartErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard chart rendering failed', {
      chartTitle: this.props.chartTitle,
      error,
      componentStack: info.componentStack,
    });
  }

  public componentDidUpdate(previousProps: ChartErrorBoundaryProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false });
    }
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section
        className="flex min-h-64 flex-col items-center justify-center rounded-t-xl border border-rose-900/70 bg-rose-950/20 px-6 py-10 text-center"
        role="alert"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-800 bg-rose-950 text-rose-300">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-white">Visual unavailable</h3>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
          {this.props.chartTitle} could not be rendered from the current dataset and
          configuration. Other dashboard visuals remain available.
        </p>
        <p className="mt-2 text-[11px] text-rose-300">
          This state indicates a rendering problem, not a zero indicator value.
        </p>
        <button
          type="button"
          onClick={this.retry}
          className="mt-4 flex items-center gap-1.5 rounded-lg border border-rose-800 bg-rose-950 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-900"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry visual
        </button>
      </section>
    );
  }
}
