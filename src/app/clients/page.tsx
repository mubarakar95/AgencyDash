"use client";

import { useEffect, useState } from "react";
import { NewClientModal } from "@/components/modals/NewClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { ViewClientModal } from "@/components/modals/ViewClientModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  Users,
  Mail,
  UserPlus,
  Search,
  Star,
  Sparkles,
  ChevronRight,
  Crown,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingClient, setDeletingClient] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const active = clients.filter((c) => c.status === "active").length;
  const leads = clients.filter((c) => c.status === "lead").length;
  const totalProjects = clients.reduce((acc, c) => acc + (c.projects_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      {/* Header matching dashboard */}
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative flex items-center justify-center">
            <Users className="w-6 h-6 text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.6)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Clients</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-2 text-gray-300 hover:text-white transition-colors border border-white/5">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{clients.length}</span>
          </button>
          <button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-white/5">
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Greeting + Quick Actions Row */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 px-2 gap-6">
        <div className="flex-1">
          <h2 className="text-4xl font-semibold mb-3 tracking-tight text-white">Your Network</h2>
          <p className="text-gray-400 text-lg">Manage relationships and track client projects.</p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2">
          <button className="min-w-[60px] h-[72px] bg-white rounded-2xl flex items-center justify-center text-gray-900 text-xl font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform shrink-0">
            <UserPlus className="w-6 h-6" />
          </button>
          <div className="glass-panel min-w-[200px] h-[72px] rounded-2xl flex items-center justify-between px-5 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Active</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{active} clients</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          <div className="glass-panel min-w-[200px] h-[72px] rounded-2xl flex items-center justify-between px-5 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Leads</span>
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{leads} prospects</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          <div className="glass-panel min-w-[200px] h-[72px] rounded-2xl flex items-center justify-between px-5 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/90 right-0 w-12 z-0 pointer-events-none" />
            <div className="relative z-10 w-full overflow-hidden">
              <div className="font-semibold text-white flex items-center gap-2 whitespace-nowrap">
                All Projects <Sparkles className="w-3 h-3 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-40">
                {totalProjects} total projects
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width Client Table */}
      <div className="px-2 pb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-gray-900">All Clients</h3>
              <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">{filtered.length} total</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="w-56 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Add Client
              </button>
            </div>
          </div>

          <div className="overflow-x-auto px-8 pb-6 pt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal w-[28%]">Client</th>
                  <th className="pb-4 font-normal w-[14%]">Status</th>
                  <th className="pb-4 font-normal w-[22%]">Contact</th>
                  <th className="pb-4 font-normal w-[10%]">Projects</th>
                  <th className="pb-4 font-normal w-[12%]">Balance</th>
                  <th className="pb-4 font-normal w-[10%]">Last Contact</th>
                  <th className="pb-4 font-normal w-[6%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">No clients found</td>
                  </tr>
                ) : (
                  filtered.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setViewingClient(client)}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {client.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            {client.company && <p className="text-xs text-gray-500">{client.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            client.status === "active"
                              ? "bg-green-100 text-green-700"
                              : client.status === "lead"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.user_id && (
                          <span className="text-[10px] text-emerald-600 mt-0.5 block">Has portal access</span>
                        )}
                      </td>
                      <td className="py-4 text-gray-500">{client.projects_count || 0}</td>
                      <td className="py-4">
                        <span className={`text-xs font-medium ${
                          getBalance(client.id) > 0
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}>
                          ₹{getBalance(client.id).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400 text-xs">{client.last_contact ? new Date(client.last_contact).toLocaleDateString() : "—"}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingClient(client)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingClient(client)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row — stats cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 pb-8">
        <div className="bg-[#222226] rounded-3xl p-6 border border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <TrendingUp className="w-4 h-4" /> Client Growth
          </div>
          <div className="flex items-end justify-between gap-2 flex-1 pt-2">
            {["Jan", "Feb", "Mar", "Apr", "May"].map((month, idx) => {
              const values = [30, 45, 25, 60, 75];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-gray-700 to-gray-600 border-t border-emerald-500"
                    style={{ height: `${values[idx] * 0.6}px` }}
                  />
                  <span className="text-[10px] text-gray-500">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#222226] rounded-3xl p-6 border border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-white">Top Client</p>
              {clients[0] && <p className="text-xs text-gray-400">{clients[0].name}</p>}
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-xs text-gray-500 leading-relaxed">Your most valuable relationship. Reach out for a quarterly review.</p>
          </div>
        </div>

        <div className="bg-[#222226] rounded-3xl p-6 border border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status Overview</span>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{clients.length} total</span>
          </div>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {[
              { label: "Active", value: active, color: "bg-emerald-500" },
              { label: "Leads", value: leads, color: "bg-blue-500" },
              { label: "Inactive", value: clients.filter((c) => c.status === "inactive").length, color: "bg-gray-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-14 shrink-0">{item.label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${clients.length ? (item.value / clients.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-white w-6 text-right">{item.value}</span>
              </div>
            ))}
          </div>
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
        message={`Are you sure you want to delete "${deletingClient?.name}"? This action cannot be undone and may affect related projects and renewals.`}
        loading={deleteLoading}
      />
    </div>
  );
}
