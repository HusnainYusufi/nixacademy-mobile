import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query';
import { LocaleProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { ToastProvider } from '@/components/ui/toast';
import { initNative } from '@/lib/native';
import { AppRoutes } from '@/router';

export function App() {
  useEffect(() => {
    void initNative();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <HashRouter>
                <AppRoutes />
              </HashRouter>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
