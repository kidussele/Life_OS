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
  Sprout,
  Compass,
  X,
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
}

const navItems: NavItem[] = [
  { name: "My Day", href: "/my-day", icon: Sun, badge: "Primary" },
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Life Journey", href: "/journey", icon: Compass, badge: "Roadmap" },
  { name: "Calendar", href: "/calendar", icon: Calendar },
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
  { name: "Reports & Stats", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E2E9E4] flex flex-col justify-between h-screen overflow-y-auto select-none px-4 py-4 transition-transform duration-200 lg:static lg:translate-x-0 lg:w-64 lg:flex-shrink-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo Section with Mobile Close Button */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center space-x-2.5 px-2 py-1"
            >
              <div className="w-8 h-8 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center shadow-xs">
                <Sprout size={22} className="text-[#165B33]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[17px] tracking-tight text-[#123D26]">
                    LIFE OS
                  </span>
                </div>
                <span className="block text-[11px] text-[#6C8176] font-medium leading-none -mt-0.5">
                  Organize Your Life
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-[#F3F7F4] rounded-lg transition-colors cursor-pointer"
              title="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

        {/* Navigation List */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#EBF5EE] text-[#165B33] font-semibold"
                    : "text-[#485A50] hover:text-[#14211A] hover:bg-[#F7FAF8]"
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    size={17}
                    className={`flex-shrink-0 ${
                      isActive ? "text-[#165B33]" : "text-[#6C8176]"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#165B33] text-white"
                        : "bg-[#EBF5EE] text-[#165B33]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Mini Motivational Card */}
      <div className="pt-4 border-t border-[#E8ECE8] space-y-3">
        {/* User Card */}
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F7FAF8] transition-colors"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-[#CBD7CE]">
              <Image
                src="/avatar.jpg"
                alt="Kidus Seleshi"
                fill
                className="object-cover"
              />
            </div>
            <div className="truncate">
              <div className="text-[13px] font-bold text-[#14211A] truncate">
                Kidus Seleshi
              </div>
              <div className="text-[11px] text-[#6C8176] truncate">
                Full Stack Developer
              </div>
            </div>
          </div>
          <ChevronDown size={15} className="text-[#6C8176] flex-shrink-0 ml-1" />
        </Link>

        {/* Motivational Card */}
        <div className="p-3 bg-[#F3F9F5] rounded-xl border border-[#DCEEE3] flex items-start space-x-2.5">
          <Sprout size={16} className="text-[#165B33] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#345140] leading-snug font-medium">
            Small consistent steps create big results.
          </p>
        </div>
      </div>
    </aside>
  </>
  );
}
