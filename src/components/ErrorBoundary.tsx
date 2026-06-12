import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error boundary catch:", error, errorInfo);
    this.setState({ componentStack: errorInfo.componentStack || null });
  }

  private handleReset = () => {
    const keys = [
      "sahm_web_user", "sahm_web_user3", "sahm_web_users_list3",
      "sahm_impersonate_tenant_id", "sahm_impersonate_org_id", "sahm_impersonate_company_name",
      "active_store_id", "sahm_active_store_id", "active_branch_id", "sahm_active_branch_id"
    ];
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  private handleBackToPlatform = () => {
    const keys = [
      "sahm_impersonate_tenant_id", "sahm_impersonate_org_id", "sahm_impersonate_company_name",
      "active_store_id", "sahm_active_store_id", "active_branch_id", "sahm_active_branch_id"
    ];
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const componentStack = this.state.componentStack || "";
      let componentName = "غير محدد";
      if (componentStack) {
        const match = componentStack.match(/^\s*in\s+(\w+)/m) || componentStack.match(/at\s+(\w+)/);
        if (match && match[1]) componentName = match[1];
      }

      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#0e0a0a] text-[#f87171] p-6 font-sans select-none antialiased" dir="rtl">
          <div className="flex flex-col items-center max-w-md w-full text-center space-y-6 bg-[#1f0f0f]/30 p-8 rounded-2xl border border-red-500/20 shadow-2xl">
            <svg className="w-16 h-16 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-2">
              <h1 className="text-xl font-black tracking-tight text-red-200">حدث خطأ غير متوقع في النظام</h1>
              <p className="text-xs font-bold text-red-300 bg-red-950/20 px-2 py-1 rounded">
                المكون المتأثر: <span className="font-extrabold underline">{componentName}</span>
              </p>
              <p className="text-xs text-red-400 font-mono text-right bg-black/40 p-4 rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
                {this.state.error?.toString() || "خطأ مجهول أثناء التشغيل"}
              </p>
            </div>
            <button
              onClick={this.handleBackToPlatform}
              className="w-full py-2.5 px-4 bg-red-750 hover:bg-red-700 active:bg-red-800 text-white rounded-xl transition font-medium text-sm border border-red-500/30 cursor-pointer"
            >
              العودة إلى لوحة المنصة / تسجيل الدخول
            </button>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-550 active:bg-amber-700 text-slate-950 font-black rounded-xl transition text-sm border border-amber-500/30 cursor-pointer"
            >
              إعادة ضبط الجلسة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
