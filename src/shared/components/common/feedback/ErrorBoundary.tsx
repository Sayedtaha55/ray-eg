import React from 'react';
import i18n from '@/i18n';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    try {
      console.error('App ErrorBoundary caught an error', error);
    } catch {
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center p-6" dir="rtl">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-black">{i18n.t('common.errorBoundary.title')}</div>
            <div className="mt-2 text-sm text-white/70">
              {i18n.t('common.errorBoundary.desc')}
            </div>
            <button
              onClick={this.handleReload}
              className="mt-5 w-full rounded-xl bg-[#00E5FF] text-[#0B1220] font-black py-3 hover:opacity-90 transition-opacity"
              type="button"
            >
              {i18n.t('common.errorBoundary.refreshPage')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
