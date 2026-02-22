import React from 'react';

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
      try {
        if (typeof window !== 'undefined') {
          const routerMode = String((window as any)?.__VITE_ROUTER_MODE || '').trim().toLowerCase();
          const isBrowserRouter = routerMode === 'browser';

          const currentPath = String(window.location?.pathname || '');
          const currentHash = String(window.location?.hash || '');
          const isOn404 = isBrowserRouter
            ? currentPath === '/404'
            : currentHash.startsWith('#/404');

          if (!isOn404) {
            const target = isBrowserRouter ? '/404?reason=error' : '/#/404?reason=error';
            window.location.replace(target);
            return null;
          }
        }
      } catch {
      }
      return (
        <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center p-6" dir="rtl">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-black">حصل خطأ غير متوقع</div>
            <div className="mt-2 text-sm text-white/70">
              حاول تحديث الصفحة. لو المشكلة بتتكرر، ابعتلنا صورة من الخطأ.
            </div>
            <button
              onClick={this.handleReload}
              className="mt-5 w-full rounded-xl bg-[#00E5FF] text-[#0B1220] font-black py-3 hover:opacity-90 transition-opacity"
              type="button"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
