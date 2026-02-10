"use client"; // Wajib karena pakai Provider (Context)

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Query Client untuk React Query
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Biar gak reload pas ganti tab
        retry: 1, // Coba ulang 1x kalau gagal
      },
    },
  }));

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ReduxProvider>
  );
}