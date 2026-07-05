"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/*
  All CLIENT-side context providers live here (TanStack Query, theme, etc.).
  This is a Client Component ("use client") mounted once in the root layout.

  Why a lazy useState for the QueryClient:
  in the App Router the module can be evaluated on the server too. Creating the
  client inside useState guarantees ONE instance per browser tab and never
  leaks a shared cache between requests on the server.
*/
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 min: don't refetch on every mount
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
