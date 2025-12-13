"use client";

import { useMemo, memo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load Sidebar to reduce initial bundle size
const Sidebar = dynamic(() => import("@/components/layout/Sidebar"), {
  ssr: false,
  loading: () => (
    <div className="fixed left-0 top-0 h-full w-20 bg-stone-900 animate-pulse lg:block hidden" />
  ),
});

export const DashboardLayout = memo(function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract view from pathname - memoized for performance
  const currentView = useMemo(():
    | "pos"
    | "barista"
    | "manager"
    | "menu"
    | "inventory"
    | "employees"
    | "customers"
    | "orders" => {
    if (pathname.startsWith("/pos")) return "pos";
    if (pathname.startsWith("/barista")) return "barista";
    if (pathname.startsWith("/manager")) return "manager";
    if (pathname.startsWith("/menu")) return "menu";
    if (pathname.startsWith("/inventory")) return "inventory";
    if (pathname.startsWith("/employees")) return "employees";
    if (pathname.startsWith("/customers")) return "customers";
    if (pathname.startsWith("/orders")) return "orders";
    return "pos";
  }, [pathname]);

  const handleViewChange = useMemo(
    () =>
      (view: string): void => {
        router.push(`/${view}`);
      },
    [router]
  );

  // Don't show dashboard layout on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="font-sans text-stone-800 bg-stone-50 min-h-screen">
        <Sidebar currentView={currentView} setView={handleViewChange} />
        <main className="transition-all duration-300 lg:pl-20 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
});
