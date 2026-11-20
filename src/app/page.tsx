"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { NewProjectModal } from "@/components/modals/NewProjectModal";
import {
  FolderOpen,
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  Plus,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  CreditCard,
  Building2,
  Calendar,
  ChevronRight,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick modals
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedPaymentClient, setSelectedPaymentClient] = useState<any | null>(null);

  function loadDashboardData() {
    setLoading(true);
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/renewals").then((r) => r.json()),
    ])
      .then(([projectsData, clientsData, txnsData, renewalsData]) => {
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setTransactions(Array.isArray(txnsData) ? txnsData : []);
        setRenewals(Array.isArray(renewalsData) ? renewalsData : []);
      })
      .catch((err) => console.error("Failed to load dashboard data", err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  // Calculate high-precision financial KPIs
  const totalInvoiced = transactions
    .filter((t) => t.type === "invoice")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalCollected = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Per client balances
  const clientBalances = clients.map((c) => {
    const clientTxns = transactions.filter((t) => t.client_id === c.id);
    const invoiced = clientTxns
      .filter((t) => t.type === "invoice")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const paid = clientTxns
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return {
      ...c,
      invoiced,
      paid,
      balance: invoiced - paid,
    };
  });

  const totalReceivables = clientBalances.reduce((sum, c) => sum + Math.max(c.balance, 0), 0);
  const clientsWithDues = clientBalances.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance);

  const activeProjectsList = projects.filter(
    (p) => p.status !== "delivered" && p.status !== "completed"
  );

  const criticalRenewals = renewals.filter(
    (r) => r.status === "critical" || r.status === "warning" || r.status === "expired"
  );

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-2 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo-wide.png" alt="AgencyDash" width={160} height={44} className="shrink-0" priority />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewProject(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Project
          </button>
          <button
            onClick={() => setShowNewInvoice(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Plus className="w-3.5 h-3.5" /> Issue Bill
          </button>
          <NotificationBell />
          <ProfileMenu />
        </div>
      </header>

      {/* Greeting & Executive Snapshot */}
      <section className="mb-6 px-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Agency Command Center</h2>
          <p className="text-gray-400 text-sm mt-1">
            Real-time operations, client receivables, and active delivery pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/payments"
            className="px-3.5 py-2 rounded-xl bg-[#1a1a1e] hover:bg-white/5 border border-white/5 text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            Payments Ledger
          </Link>
          <Link
            href="/clients"
            className="px-3.5 py-2 rounded-xl bg-[#1a1a1e] hover:bg-white/5 border border-white/5 text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Client Directory
          </Link>
        </div>
      </section>

      {/* 4 Balanced Financial & Ops KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 mb-8 shrink-0">
        {/* Outstanding Receivables */}
        <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Pending Receivables</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-400">
            ₹{totalReceivables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            {clientsWithDues.length} client{clientsWithDues.length === 1 ? "" : "s"} with unpaid balance
          </p>
        </div>

        {/* Total Collected */}
        <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Payments Collected</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            ₹{totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            {transactions.filter((t) => t.type === "payment").length} successful payments
          </p>
        </div>

        {/* Active Projects */}
        <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Active Projects</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{activeProjectsList.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {projects.length} total across agency
          </p>
        </div>

        {/* Asset Renewals */}
        <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Domains & Hosting</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{renewals.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {criticalRenewals.length > 0 ? (
              <span className="text-amber-400 font-medium">{criticalRenewals.length} need renewal attention</span>
            ) : (
              <span className="text-emerald-400 font-medium">All assets safe</span>
            )}
          </p>
        </div>
      </div>

      {/* Main Two-Column Usability Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2 mb-8">
        {/* Left Column (7 cols): Active Projects & Deliverables */}
        <div className="lg:col-span-7 bg-[#1a1a1e] rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Active Projects & Delivery</h3>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeProjectsList.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No active projects right now.
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjectsList.slice(0, 6).map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-2xl bg-[#222226] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href="/projects"
                          className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate text-sm"
                        >
                          {project.name}
                        </Link>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-300 capitalize border border-white/10">
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>Budget: ₹{Number(project.budget || 0).toLocaleString()}</span>
                        {project.deadline && <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>}
                      </div>
                      <div className="mt-3 flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">{project.progress || 0}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setShowNewInvoice(true)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
                        title="Generate Bill for Project"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Bill
                      </button>
                      <Link
                        href="/tasks"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="View Tasks"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Unsettled Client Accounts & Receivables */}
        <div className="lg:col-span-5 bg-[#1a1a1e] rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Client Receivables</h3>
              </div>
              <Link
                href="/clients"
                className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                All Clients <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {clientsWithDues.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-semibold text-white">All Accounts Settled!</p>
                <p className="text-xs text-gray-500 mt-0.5">No pending payments due from clients.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientsWithDues.slice(0, 5).map((client) => (
                  <div
                    key={client.id}
                    className="p-4 rounded-2xl bg-[#222226] border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm flex items-center gap-1.5 truncate"
                      >
                        {client.name}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                      </Link>
                      {client.company && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{client.company}</p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">
                        Billed: ₹{Number(client.invoiced).toFixed(2)} • Paid: ₹{Number(client.paid).toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-red-400">
                        ₹{client.balance.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 justify-end">
                        <button
                          onClick={() => setSelectedPaymentClient(client)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-colors"
                        >
                          + Pay
                        </button>
                        <Link
                          href={`/clients/${client.id}`}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          Ledger
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expirations & Renewals Row */}
      <div className="px-2">
        <div className="bg-[#1a1a1e] rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Domain, Hosting & License Renewals</h3>
            </div>
            <Link
              href="/renewals"
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Manage all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {renewals.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#222226] border border-white/5 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[180px]">{item.asset_name}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{item.type} • {item.provider || "Self"}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Exp: {new Date(item.expiry_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === "safe"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                  <p className="text-xs font-semibold text-gray-300 mt-2">${item.cost || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <NewInvoiceModal
        isOpen={showNewInvoice}
        onClose={() => setShowNewInvoice(false)}
        onSuccess={() => {
          setShowNewInvoice(false);
          loadDashboardData();
        }}
      />

      <NewProjectModal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        onSuccess={() => {
          setShowNewProject(false);
          loadDashboardData();
        }}
      />

      {selectedPaymentClient && (
        <RecordPaymentModal
          isOpen={!!selectedPaymentClient}
          onClose={() => setSelectedPaymentClient(null)}
          onSuccess={() => {
            setSelectedPaymentClient(null);
            loadDashboardData();
          }}
          clientId={selectedPaymentClient.id}
          clientName={selectedPaymentClient.name}
          outstandingBalance={selectedPaymentClient.balance}
        />
      )}
    </div>
  );
}
