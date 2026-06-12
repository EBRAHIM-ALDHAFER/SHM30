import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

if (typeof window !== "undefined") {
  const originalGetItem = localStorage.getItem.bind(localStorage);
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  const isForbiddenKey = (key: string): boolean => {
    if (!key) return false;
    const k = key.toLowerCase();
    
    // Allow non-commercial preferences
    if (
      k.includes("active_store_id") || 
      k.includes("active_company_id") || 
      k.includes("active_branch_id") || 
      k.includes("theme") || 
      k.includes("lang") || 
      k.includes("sidebar")
    ) {
      return false;
    }
    
    const exactForbiddenKeys = [
      "sahm_web_products",
      "sahm_web_invoices",
      "sahm_web_customers",
      "sahm_web_stores",
      "sahm_web_branches",
      "sahm_web_warehouses",
      "sahm_pos_active_shift",
      "sahm_pos_shifts_history",
      "sahm_audit_logs",
      "sahm_audit_logs_v8",
      "sahm_audit_logs_v9"
    ];
    if (exactForbiddenKeys.some(ek => k === ek.toLowerCase())) {
      return true;
    }

    const forbiddenKeywords = [
      "products", "invoices", "customers", "suppliers", "stores", "branches", "warehouses", "pos_units", 
      "shifts", "shift_balances", "audit_logs", "campaigns", "competitor", "timeline", "notification", 
      "transfers", "trash_bin", "journal_entry", "expense", "fixed_asset", "companies",
      "supabase_url", "supabase_key", "supabase_anon_key", "supabase_connected"
    ];
    return forbiddenKeywords.some(keyword => k.includes(keyword));
  };

  const isSupabaseMode = import.meta.env.VITE_DATA_MODE === "supabase" || import.meta.env.VITE_DATA_MODE === "production";

  localStorage.getItem = function (key: string) {
    if (isSupabaseMode && isForbiddenKey(key)) {
      return null;
    }
    if (key.toLowerCase().includes("supabase_url") || key.toLowerCase().includes("supabase_key") || key.toLowerCase().includes("supabase_anon_key") || key.toLowerCase().includes("supabase_connected")) {
      return null;
    }
    return originalGetItem(key);
  };

  localStorage.setItem = function (key: string, value: string) {
    if (isSupabaseMode && isForbiddenKey(key)) {
      return;
    }
    if (key.toLowerCase().includes("supabase_url") || key.toLowerCase().includes("supabase_key") || key.toLowerCase().includes("supabase_anon_key") || key.toLowerCase().includes("supabase_connected")) {
      return;
    }
    return originalSetItem(key, value);
  };

  localStorage.removeItem = function (key: string) {
    if (isSupabaseMode && isForbiddenKey(key)) {
      return;
    }
    if (key.toLowerCase().includes("supabase_url") || key.toLowerCase().includes("supabase_key") || key.toLowerCase().includes("supabase_anon_key") || key.toLowerCase().includes("supabase_connected")) {
      return;
    }
    return originalRemoveItem(key);
  };
}

import App from './App.tsx';
import './index.css';
import { StoreProvider } from './core/stores/StoreContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ErrorBoundary>
  </StrictMode>,
);

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[Sahm OS] Service Worker registered successfully: ', reg.scope);
      })
      .catch((err) => {
        console.warn('[Sahm OS] Service Worker registration failed: ', err);
      });
  });
}
