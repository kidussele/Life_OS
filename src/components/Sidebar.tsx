"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Sun,
  Calendar,
  Target,
  Grid,
  Flame,
  Anchor,
  GraduationCap,
  TrendingUp,
  Store,
  CandlestickChart,
  Wallet,
  Activity,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Compass,
  X,
  Sparkles,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems: NavItem[] = [
  { name: "My Day", href: "/my-day", icon: Sun, badge: "Primary" },
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Life Journey", href: "/journey", icon: Compass, badge: "Roadmap" },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Smart Planner", href: "/planner", icon: Sparkles, badge: "Weekly" },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Life Categories", href: "/categories", icon: Grid },
  { name: "Discipline", href: "/discipline", icon: Flame },
  { name: "Spiritual Life", href: "/spiritual", icon: Anchor },
  { name: "Career & Learning", href: "/learning", icon: GraduationCap },
  { name: "Freelancing", href: "/freelancing", icon: TrendingUp },
  { name: "Business (Suku)", href: "/suku", icon: Store },
  { name: "Forex Journal", href: "/forex", icon: CandlestickChart },
  { name: "Financial Management", href: "/finances", icon: Wallet },
  { name: "Health & Fitness", href: "/health", icon: Activity },
  { name: "Family & Relations", href: "/family", icon: Users },
  { name: "Analysis", href: "/analysis", icon: Activity, badge: "Metrics" },
  { name: "Reports & Stats", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({
  mobileOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      <aside
        id="life-os-sidebar"
        aria-label="Main Navigation"
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-[#E2E9E4] flex flex-col justify-between h-screen overflow-y-auto overflow-x-hidden select-none transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex-shrink-0 ${
          /* Mobile Drawer: always full width when opened, slide from left */
          mobileOpen
            ? "translate-x-0 w-72 max-w-[85vw] px-4 py-4 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${
          /* Desktop Width: collapsed vs expanded */
          isCollapsed ? "lg:w-[72px] lg:px-2.5 lg:py-4" : "lg:w-[260px] lg:px-4 lg:py-4"
        }`}
      >
        <div>
          {/* Header Section: Logo + Mobile Close / Desktop Collapse Button */}
          <div
            className={`flex items-center mb-5 ${
              isCollapsed
                ? "justify-center flex-col gap-2.5"
                : "justify-between px-1"
            }`}
          >
            {/* Logo Link */}
            <Link
              href="/"
              onClick={onClose}
              title="LIFE OS — Organize Your Life"
              className={`flex items-center space-x-2.5 rounded-xl hover:bg-[#F3F7F4] p-1 transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center shadow-2xs border border-[#D5E6DC] flex-shrink-0">
                <Sprout size={20} className="text-[#165B33]" />
              </div>

              {/* Text hidden when desktop collapsed */}
              <div className={isCollapsed ? "hidden" : "block min-w-0"}>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[16px] tracking-tight text-[#123D26] truncate">
                    LIFE OS
                  </span>
                </div>
                <span className="block text-[10.5px] text-[#6C8176] font-medium leading-none -mt-0.5 truncate">
                  Organize Your Life
                </span>
              </div>
            </Link>

            {/* Mobile Close Button (Hidden on Desktop) */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-[#F3F7F4] rounded-lg transition-colors cursor-pointer"
              title="Close navigation"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>

            {/* Desktop Collapse / Expand Toggle Button */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className={`hidden lg:flex p-1.5 text-[#6C8176] hover:text-[#165B33] hover:bg-[#EBF5EE] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#D5E6DC] ${
                  isCollapsed ? "mt-1" : ""
                }`}
                title={
                  isCollapsed
                    ? "Expand sidebar (Ctrl+B)"
                    : "Collapse sidebar (Ctrl+B)"
                }
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
              </button>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    title={
                      isCollapsed
                        ? `${item.name}${item.badge ? ` (${item.badge})` : ""}`
                        : undefined
                    }
                    className={`flex items-center rounded-xl text-[13px] font-medium transition-all ${
                      isCollapsed
                        ? "justify-center p-2.5"
                        : "justify-between px-3.5 py-2"
                    } ${
                      isActive
                        ? "bg-[#EBF5EE] text-[#165B33] font-semibold shadow-2xs border border-[#D5E6DC]"
                        : "text-[#485A50] hover:text-[#14211A] hover:bg-[#F7FAF8]"
                    }`}
                  >
                    <div
                      className={`flex items-center truncate ${
                        isCollapsed ? "justify-center relative" : "space-x-3"
                      }`}
                    >
                      <Icon
                        size={17}
                        className={`flex-shrink-0 transition-transform ${
                          isActive
                            ? "text-[#165B33]"
                            : "text-[#6C8176] group-hover:text-[#165B33]"
                        }`}
                      />
                      {/* Active indicator dot when collapsed */}
                      {isCollapsed && isActive && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#165B33]" />
                      )}
                      {/* Item label - hidden in collapsed state on desktop */}
                      <span className={isCollapsed ? "hidden" : "truncate"}>
                        {item.name}
                      </span>
                    </div>

                    {/* Badge - hidden in collapsed state on desktop */}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-1 ${
                          isActive
                            ? "bg-[#165B33] text-white"
                            : "bg-[#EBF5EE] text-[#165B33]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Desktop Floating Tooltip on Hover in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-[#14211A] text-white text-[11.5px] font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#269153] text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile and Motivational Card */}
        <div className="pt-3 border-t border-[#E8ECE8] space-y-2.5">
          {/* User Profile Card */}
          <div className="relative group">
            <Link
              href="/settings"
              onClick={onClose}
              title={isCollapsed ? "Kidus Seleshi — Settings" : undefined}
              className={`flex items-center rounded-xl hover:bg-[#F7FAF8] transition-colors p-1.5 ${
                isCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div
                className={`flex items-center overflow-hidden ${
                  isCollapsed ? "justify-center" : "space-x-2.5"
                }`}
              >
                <div className="relative w-8.5 h-8.5 rounded-full overflow-hidden flex-shrink-0 border border-[#CBD7CE] shadow-2xs">
                  <Image
                    src="/avatar.jpg"
                    alt="Kidus Seleshi"
                    fill
                    className="object-cover"
                  />
                </div>
                {!isCollapsed && (
                  <div className="truncate min-w-0">
                    <div className="text-[12.5px] font-bold text-[#14211A] truncate">
                      Kidus Seleshi
                    </div>
                    <div className="text-[10.5px] text-[#6C8176] truncate">
                      Full Stack Developer
                    </div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={14}
                  className="text-[#6C8176] flex-shrink-0 ml-1"
                />
              )}
            </Link>

            {/* Collapsed profile tooltip */}
            {isCollapsed && (
              <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 bottom-2 z-50 px-2.5 py-1.5 bg-[#14211A] text-white text-[11.5px] font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                <span>Kidus Seleshi</span>
                <span className="text-[9px] text-[#9CB6A6]">Settings</span>
              </div>
            )}
          </div>

          {/* Motivational Mini Card (Hidden when desktop collapsed) */}
          {!isCollapsed && (
            <div className="p-2.5 bg-[#F3F9F5] rounded-xl border border-[#DCEEE3] flex items-start space-x-2">
              <Sprout size={15} className="text-[#165B33] flex-shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-[#345140] leading-snug font-medium">
                Small consistent steps create big results.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
