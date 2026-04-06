import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { RotateCcw, AlertTriangle } from "@/components/animate-ui/icons/index.ts";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-light flex items-center justify-center">
            <AlertTriangle size={28} className="text-rose" />
          </div>
          <p className="text-[16px] font-bold text-ink text-center">
            {this.props.fallbackTitle || "Something went wrong"}
          </p>
          <p className="text-[12px] text-ink-muted text-center max-w-[260px]">
            An unexpected error occurred. Try again or reload the app.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral text-white text-[13px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)]"
          >
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
