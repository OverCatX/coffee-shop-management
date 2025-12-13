"use client";

import { memo, useCallback, useState, useEffect, useMemo } from "react";
import {
  Coffee,
  ShoppingBag,
  ChefHat,
  Settings,
  Users,
  Package,
  Menu,
  BarChart3,
  UserCircle,
  X,
  LogOut,
} from "lucide-react";
import NavButton from "./NavButton";
import { useAuth } from "@/contexts/AuthContext";

type ViewType =
  | "pos"
  | "barista"
  | "manager"
  | "menu"
  | "inventory"
  | "employees"
  | "customers"
  | "orders";

interface SidebarProps {
  currentView: ViewType;
  setView: (view: string) => void;
}

const Sidebar = memo<SidebarProps>(function Sidebar({ currentView, setView }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout, hasRole } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNavClick = useCallback(
    (view: string) => {
      setView(view);
      if (isMobile) {
        setIsMobileOpen(false);
      }
    },
    [setView, isMobile]
  );

  // Role-based navigation items - filter based on user role
  const navItems = useMemo(() => {
    if (!user) return [];

    const allItems = [
      { view: "pos", icon: <ShoppingBag size={24} />, label: "POS", roles: ["Cashier", "Manager"] },
      { view: "barista", icon: <ChefHat size={24} />, label: "Barista", roles: ["Barista", "Manager"] },
      { view: "manager", icon: <BarChart3 size={24} />, label: "Dashboard", roles: ["Manager"] },
      { view: "menu", icon: <Menu size={24} />, label: "Menu", roles: ["Manager", "Barista"] },
      { view: "inventory", icon: <Package size={24} />, label: "Inventory", roles: ["Manager"] },
      { view: "employees", icon: <Users size={24} />, label: "Employees", roles: ["Manager"] },
      { view: "customers", icon: <UserCircle size={24} />, label: "Customers", roles: ["Manager", "Cashier"] },
      { view: "orders", icon: <ShoppingBag size={24} />, label: "Orders", roles: ["Manager", "Barista", "Cashier"] },
    ];

    // Filter items based on user role - only show items user has access to
    return allItems.filter((item) => hasRole(item.roles));
  }, [user, hasRole]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-stone-900 text-white p-3 rounded-xl shadow-lg"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-stone-900 z-50 shadow-xl transition-transform duration-300 ${
          isMobile
            ? `w-64 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : "w-20 translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full py-8">
          {/* Header */}
          <div className="flex items-center justify-between px-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-xl">
                <Coffee className="text-white" size={isMobile ? 28 : 24} />
              </div>
              {isMobile && (
                <div>
                  <span className="text-white font-bold text-lg block">Coffee Shop</span>
                  <span className="text-stone-400 text-xs">{user?.name}</span>
                  <span className="text-stone-500 text-xs block">{user?.role}</span>
                </div>
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-white hover:text-amber-400 transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Navigation Items - Only show items user has access to */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto px-2">
            {navItems.length === 0 ? (
              <div className="text-stone-400 text-xs text-center p-4">
                No accessible features
              </div>
            ) : (
              navItems.map((item) => (
                <NavButton
                  key={item.view}
                  active={currentView === item.view}
                  onClick={() => handleNavClick(item.view)}
                  icon={item.icon}
                  label={item.label}
                  isMobile={isMobile}
                />
              ))
            )}
          </div>

          {/* User Info & Logout */}
          <div className="px-2 mt-auto space-y-2">
            {isMobile && user && (
              <div className="px-3 py-2 bg-stone-800 rounded-xl mb-2">
                <p className="text-white text-xs font-medium">{user.name}</p>
                <p className="text-stone-400 text-xs">{user.role}</p>
              </div>
            )}
            <NavButton
              icon={<Settings size={24} />}
              label="Settings"
              isMobile={isMobile}
            />
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 text-stone-400 hover:text-red-400 hover:bg-stone-800 ${
                isMobile ? "justify-start" : "flex-col justify-center"
              }`}
              aria-label="Logout"
            >
              <LogOut size={24} />
              {isMobile && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
