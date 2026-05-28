"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Globe, CreditCard, MessageSquare, Ticket, LogOut } from "lucide-react";

const portalNav = [
  { name: "My Projects", href: "/portal/projects", icon: FolderOpen },
  { name: "Renewals", href: "/portal/renewals", icon: Globe },
  { name: "Invoices", href: "/portal/invoices", icon: CreditCard },
  { name: "Tickets", href: "/portal/tickets", icon: Ticket },
  { name: "Messages", href: "/portal/messages", icon: MessageSquare },
];

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] || "Client";
  const initials = (user?.email?.substring(0, 2) || "CL").toUpperCase();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-[#111111] border-b border-white/10 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-white">Client Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Welcome, {displayName}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-xs font-medium text-white">
              {initials}
            </div>
            <button
              onClick={async () => {
                const { createClient } = await import("@/lib/supabaseClient");
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-[#111111] border-b border-white/10 shrink-0">
        <nav className="flex px-6">
          {portalNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "text-white border-white"
                    : "text-gray-400 border-transparent hover:text-white hover:border-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <footer className="bg-[#111111] border-t border-white/5 py-4 text-center text-sm text-gray-600 shrink-0">
        Powered by AgencyDash
      </footer>
    </div>
  );
}