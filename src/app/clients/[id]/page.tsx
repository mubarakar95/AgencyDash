"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Plus,
  Pencil,
  ExternalLink,
  Wallet,
  TrendingUp,
  Receipt,
  FolderOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { EditInvoiceModal } from "@/components/modals/EditInvoiceModal";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { EditClientModal } from "@/components/modals/EditClientModal";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "invoices" | "projects">("ledger");

  // Modals state
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [editInvoice, setEditInvoice] = useState<any | null>(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch(`/api/transactions?client_id=${clientId}`).then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ])
      .then(([clientsData, invoicesData, txnsData, projectsData]) => {
        const foundClient = Array.isArray(clientsData) ? clientsData.find((c: any) => c.id === clientId) : null;
        setClient(foundClient || null);

        const allInvoices = Array.isArray(invoicesData) ? invoicesData : [];
        setInvoices(allInvoices.filter((inv: any) => inv.client_id === clientId));

        setTransactions(Array.isArray(txnsData) ? txnsData : []);

        const allProjects = Array.isArray(projectsData) ? projectsData : [];
        setProjects(allProjects.filter((p: any) => p.client_id === clientId));
      })
      .catch((err) => console.error("Failed to load client data", err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-2xl font-bold text-white">Client Not Found</h2>
        <p className="text-gray-400 text-sm">The client account you are looking for does not exist or has been removed.</p>
        <Link
          href="/clients"
          className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
        >
          Back to Clients
        </Link>
      </div>
    );
  }

  // Financial calculations
  const totalInvoiced = transactions
    .filter((t) => t.type === "invoice")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalPaid = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balanceDue = totalInvoiced - totalPaid;

  // Running balance ledger calculation (oldest to newest, then reverse for display)
  const sortedTxns = [...transactions].sort(
    (a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime()
  );

  let currentRun = 0;
  const ledgerWithBalance = sortedTxns.map((t) => {
    if (t.type === "invoice") {
      currentRun += Number(t.amount || 0);
    } else {
      currentRun -= Number(t.amount || 0);
    }
    return { ...t, runningBalance: currentRun };
  }).reverse();

  const statusColors: Record<string, string> = {
    draft: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    sent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    paid: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    overdue: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 pb-8">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex items-center justify-between py-4 px-2 mb-4 shrink-0">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Clients</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRecordPayment(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Record Payment
          </button>
          <button
            onClick={() => setShowNewInvoice(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Client Overview Header Card */}
      <div className="bg-[#1a1a1e] rounded-3xl p-6 md:p-8 border border-white/5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
              {client.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{client.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    client.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}
                >
                  {client.status ? client.status.toUpperCase() : "ACTIVE"}
                </span>
                {client.user_id && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Client Portal Active
                  </span>
                )}
              </div>
              {client.company && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  {client.company}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditClient(true)}
              className="px-4 py-2 bg-[#222226] hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5 text-xs text-gray-300">
          <div className="flex items-center gap-2 bg-[#222226] px-3.5 py-2.5 rounded-xl border border-white/5">
            <Mail className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="truncate">{client.email || "No email"}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#222226] px-3.5 py-2.5 rounded-xl border border-white/5">
            <Phone className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="truncate">{client.phone || "No phone"}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#222226] px-3.5 py-2.5 rounded-xl border border-white/5">
            <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="truncate">{client.address || "No address provided"}</span>
          </div>
        </div>
      </div>

      {/* Financial Health Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">₹{totalInvoiced.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-gray-500 mt-1">{invoices.length} bill{invoices.length === 1 ? "" : "s"} generated</p>
        </div>

        <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Total Payments Received</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-gray-500 mt-1">{transactions.filter((t) => t.type === "payment").length} payment record(s)</p>
        </div>

        <div className={`rounded-2xl p-5 border ${
          balanceDue > 0
            ? "bg-red-500/10 border-red-500/20"
            : "bg-emerald-500/5 border-emerald-500/20"
        }`}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Current Outstanding Balance</span>
            <TrendingUp className={`w-4 h-4 ${balanceDue > 0 ? "text-red-400" : "text-emerald-400"}`} />
          </div>
          <p className={`text-2xl font-bold ${balanceDue > 0 ? "text-red-400" : "text-emerald-400"}`}>
            ₹{balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {balanceDue > 0 ? "Pending collection from client" : "All dues settled"}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "ledger"
              ? "bg-white text-gray-900"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Receipt className="w-4 h-4" />
          Statement & Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "invoices"
              ? "bg-white text-gray-900"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" />
          Invoices & Bills ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "projects"
              ? "bg-white text-gray-900"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Projects ({projects.length})
        </button>
      </div>

      {/* Tab 1: Financial Ledger Statement */}
      {activeTab === "ledger" && (
        <div className="bg-[#1a1a1e] rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Financial Statement & Ledger</h3>
            <span className="text-xs text-gray-400">Chronological activity (Invoices & Payments)</span>
          </div>

          {ledgerWithBalance.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-base font-medium text-gray-300">No transactions recorded yet</p>
              <p className="text-xs text-gray-500 mt-1">Create an invoice or record a payment to build the client ledger.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[560px] scrollbar-thin border-t border-white/5 overscroll-x-contain">
              <table className="w-full text-left border-collapse text-sm min-w-[850px]">
                <thead className="sticky top-0 bg-[#1e1e23] z-10 shadow-sm">
                  <tr className="text-xs text-gray-400 border-b border-white/5">
                    <th className="py-3.5 px-6 font-medium">Date</th>
                    <th className="py-3.5 px-6 font-medium">Type</th>
                    <th className="py-3.5 px-6 font-medium">Description / Reference</th>
                    <th className="py-3.5 px-6 font-medium">Method</th>
                    <th className="py-3.5 px-6 font-medium text-right">Invoiced (₹)</th>
                    <th className="py-3.5 px-6 font-medium text-right">Paid (₹)</th>
                    <th className="py-3.5 px-6 font-medium text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledgerWithBalance.map((item) => {
                    const isInvoice = item.type === "invoice";
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-6 text-gray-300 text-xs">
                          {item.date ? new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              isInvoice
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {isInvoice ? "BILL ISSUED" : "PAYMENT"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-white font-medium">
                          {item.description || (isInvoice ? "Invoice" : "Payment")}
                          {item.reference_id && (
                            <span className="block text-[11px] text-gray-500 font-mono mt-0.5 truncate max-w-xs">
                              Ref: {item.reference_id}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-gray-400 capitalize">
                          {item.payment_method ? item.payment_method.replace("_", " ") : "—"}
                        </td>
                        <td className="py-3.5 px-6 text-right font-medium text-white">
                          {isInvoice ? `₹${Number(item.amount).toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3.5 px-6 text-right font-medium text-emerald-400">
                          {!isInvoice ? `₹${Number(item.amount).toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3.5 px-6 text-right font-bold text-xs">
                          <span className={item.runningBalance > 0 ? "text-amber-400" : "text-emerald-400"}>
                            ₹{item.runningBalance.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Invoices List */}
      {activeTab === "invoices" && (
        <div className="bg-[#1a1a1e] rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Client Invoices</h3>
            <button
              onClick={() => setShowNewInvoice(true)}
              className="text-xs font-semibold px-3 py-1.5 bg-white text-gray-900 rounded-lg hover:scale-105 transition-transform"
            >
              + Create Invoice
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-base font-medium text-gray-300">No invoices generated yet</p>
              <p className="text-xs text-gray-500 mt-1">Issue a bill for this client using the button above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[560px] scrollbar-thin border-t border-white/5 overscroll-x-contain">
              <table className="w-full text-left border-collapse text-sm min-w-[750px]">
                <thead className="sticky top-0 bg-[#1e1e23] z-10 shadow-sm">
                  <tr className="text-xs text-gray-400 border-b border-white/5">
                    <th className="py-3.5 px-6 font-medium">Invoice #</th>
                    <th className="py-3.5 px-6 font-medium">Project</th>
                    <th className="py-3.5 px-6 font-medium">Due Date</th>
                    <th className="py-3.5 px-6 font-medium text-right">Amount</th>
                    <th className="py-3.5 px-6 font-medium text-center">Status</th>
                    <th className="py-3.5 px-6 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-6 font-bold text-white">
                        <Link
                          href={`/invoices/${inv.id}`}
                          target="_blank"
                          className="hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                        >
                          {inv.invoice_number}
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-6 text-gray-300 text-xs">
                        {inv.projects?.name || "—"}
                      </td>
                      <td className="py-3.5 px-6 text-gray-400 text-xs">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold text-white">
                        {inv.currency === "USD" ? "$" : "₹"}
                        {Number(inv.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[inv.status] || "text-gray-400"}`}>
                          {inv.status ? inv.status.toUpperCase() : "DRAFT"}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditInvoice(inv)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Edit Invoice"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/invoices/${inv.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Print / View"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Projects */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-[#1a1a1e] rounded-3xl border border-white/5 text-gray-400">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-base font-medium text-gray-300">No projects linked to this client</p>
            </div>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-white">{p.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-gray-300 capitalize border border-white/10">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Budget: ₹{Number(p.budget || 0).toLocaleString()}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <NewInvoiceModal
        isOpen={showNewInvoice}
        onClose={() => setShowNewInvoice(false)}
        onSuccess={() => {
          setShowNewInvoice(false);
          loadData();
        }}
        preselectedClientId={clientId}
      />

      <EditInvoiceModal
        isOpen={!!editInvoice}
        onClose={() => setEditInvoice(null)}
        onSuccess={() => {
          setEditInvoice(null);
          loadData();
        }}
        invoice={editInvoice}
      />

      <RecordPaymentModal
        isOpen={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
        onSuccess={() => {
          setShowRecordPayment(false);
          loadData();
        }}
        clientId={clientId}
        clientName={client.name}
        outstandingBalance={balanceDue}
      />

      <EditClientModal
        isOpen={showEditClient}
        onClose={() => setShowEditClient(false)}
        onSuccess={() => {
          setShowEditClient(false);
          loadData();
        }}
        client={client}
      />
    </div>
  );
}
