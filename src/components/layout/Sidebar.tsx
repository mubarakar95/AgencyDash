"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Home,
  FolderOpen,
  Users,
  Clock,
  CalendarDays,
  Calendar,
  Settings,
  LogOut,
  Ticket,
  ClipboardList,
  Lock,
  Banknote,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Payments", href: "/payments", icon: Banknote },
  { name: "Renewals", href: "/renewals", icon: Clock },
  { name: "Follow-ups", href: "/follow-ups", icon: CalendarDays },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Tasks", href: "/tasks", icon: ClipboardList },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminItems = [
  { name: "Users", href: "/admin/users", icon: Lock },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();

  if (pathname === "/login") return null;
  if (pathname.startsWith("/portal")) return null;

  const isHome = pathname === "/";

  return (
    <aside className="w-20 flex flex-col items-center pt-3 pb-6 justify-between h-screen shrink-0 print:hidden">
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isDashboard = item.href === "/";
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105",
                isActive
                  ? "bg-white text-gray-900 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              )}
              title={item.name}
            >
              {isDashboard && !isHome ? (
                <Image src="/logo-icon.png" alt="Dashboard" width={24} height={24} />
              ) : (
                <item.icon className="w-5 h-5" />
              )}
            </Link>
          );
        })}

        {role === "admin" && (
          <>
            <div className="w-8 h-px bg-gray-800 my-2" />
            {adminItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105",
                    isActive
                      ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                  title={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="flex flex-col items-center gap-2 mt-auto">
        <button
          onClick={signOut}
          className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800/50 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
