"use client";

import { useGeneratorStore } from "@/lib/store";
import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Canvas render failed", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <CanvasCrashFallback
          onClear={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}

function CanvasCrashFallback({ onClear }: { onClear: () => void }) {
  const reset = useGeneratorStore((s) => s.reset);

  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-hh-yellow/40 bg-hh-green-700/50 px-5 py-6 text-center"
    >
      <p className="font-mono text-sm leading-relaxed text-hh-cream">
        Something went wrong rendering your image — try a different photo
      </p>
      <button
        type="button"
        onClick={() => {
          reset();
          onClear();
        }}
        className="mt-4 rounded-full bg-hh-yellow px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-hh-green-900 shadow-stamp-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hh-yellow"
      >
        Start over
      </button>
    </div>
  );
}
