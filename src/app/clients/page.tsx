"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NewClientModal } from "@/components/modals/NewClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { ViewClientModal } from "@/components/modals/ViewClientModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  Users,
  Mail,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Receipt,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingClient, setDeletingClient] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "lead" | "dues">("all");

  function getBalance(clientId: string) {
    const clientTxns = transactions.filter((t: any) => t.client_id === clientId);
    const invoiced = clientTxns
      .filter((t: any) => t.type === "invoice")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const paid = clientTxns
      .filter((t: any) => t.type === "payment")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    return invoiced - paid;
  }

  function fetchClients() {
    setLoading(true);
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
    ])
      .then(([clientsData, txnsData]) => {
        setClients(clientsData || []);
        setTransactions(Array.isArray(txnsData) ? txnsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "active") return c.status === "active";
    if (statusFilter === "lead") return c.status === "lead";
    if (statusFilter === "dues") return getBalance(c.id) > 0;
    return true;
  });

  async function handleDeleteClient() {
    if (!deletingClient) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/clients?id=${deletingClient.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete client");
      setDeletingClient(null);
      fetchClients();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const duesCount = clients.filter((c) => getBalance(c.id) > 0).length;

  return (
    <div className="w-full flex flex-col min-h-full px-2 sm:px-4 py-4 pb-16">
      {/* Top Header & Operational Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Clients</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium">
                {filtered.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Direct client directory, ledger accounts, and billing dues.</p>
          </div>
        </div>

        {/* Filter pills + Add Client Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-[#1a1a1e] border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "all" ? "bg-white text-gray-900 font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "active" ? "bg-white text-gray-900 font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("lead")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "lead" ? "bg-white text-gray-900 font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setStatusFilter("dues")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                statusFilter === "dues" ? "bg-red-500 text-white font-semibold" : "text-red-400 hover:text-red-300"
              }`}
            >
              <span>Dues</span>
              {duesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-white text-[10px]">
                  {duesCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, email..."
              className="pl-9 pr-4 py-2 bg-[#1a1a1e] border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors w-52 sm:w-64"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-gray-900 text-xs font-bold hover:scale-105 transition-all shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Add Client
          </button>
        </div>
      </header>

      {/* Main Single-Sight Client Table */}
      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/5 bg-[#222226]/60">
                <th className="py-3 px-3 sm:px-4 font-semibold">Client / Company</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">Contact</th>
                <th className="py-3 px-3 sm:px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-3 sm:px-4 font-semibold text-center">Projects</th>
                <th className="py-3 px-3 sm:px-4 font-semibold text-right">Balance Due</th>
                <th className="py-3 px-3 sm:px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No clients found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const balance = getBalance(client.id);
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      {/* Client / Company */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                            {client.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1 truncate text-xs sm:text-sm">
                              {client.name}
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 shrink-0" />
                            </p>
                            {client.company && (
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">{client.company}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact info stacked */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-gray-300 truncate max-w-[220px]">
                            <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                            <span className="truncate">{client.email || "—"}</span>
                          </div>
                          {client.phone && (
                            <span className="text-[11px] text-gray-500 ml-4.5">{client.phone}</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            client.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : client.status === "lead"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                          }`}
                        >
                          {(client.status || "ACTIVE").toUpperCase()}
                        </span>
                      </td>

                      {/* Projects count */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 font-medium text-[11px]">
                          {client.projects_count || 0}
                        </span>
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            balance > 0
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {balance > 0 ? `₹${balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} Due` : "Settled"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/clients/${client.id}`}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="View Statement & Ledger"
                          >
                            <Receipt className="w-3 h-3 text-emerald-400" />
                            <span>Ledger</span>
                          </Link>
                          <button
                            onClick={() => setEditingClient(client)}
                            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Edit Client"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingClient(client)}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClients}
      />

      {viewingClient && (
        <ViewClientModal
          isOpen={!!viewingClient}
          onClose={() => setViewingClient(null)}
          client={viewingClient}
        />
      )}

      {editingClient && (
        <EditClientModal
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={fetchClients}
          client={editingClient}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        message={`Are you sure you want to delete "${deletingClient?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
