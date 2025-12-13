"use client";

import { memo } from "react";
import { SWRConfig } from "swr";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Memoize providers to prevent unnecessary re-renders
export const Providers = memo(function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Performance optimizations
        keepPreviousData: true,
        focusThrottleInterval: 5000,
      }}
    >
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </SWRConfig>
  );
});
