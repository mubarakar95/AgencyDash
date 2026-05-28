"use client";

import { useEffect, useState } from "react";
import { NewClientModal } from "@/components/modals/NewClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  Users,
  Mail,
  Phone,
  Building2,
  UserPlus,
  Search,
  Star,
  Sparkles,
  ChevronRight,
  Crown,
  TrendingUp,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingClient, setDeletingClient] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function fetchClients() {
    setLoading(true);
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data || []);
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

      {/* Stats Cards matching dashboard widget style */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-2 pb-8">
        {/* Client List Widget (light like Tasks List) */}
        <div className="widget-shape-light p-8 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-medium text-gray-900">Client Directory</h3>
              <div className="h-4 w-px bg-gray-300" />
              <button className="text-sm text-gray-500 flex items-center gap-2 hover:text-gray-900 transition-colors">
                <Search className="w-3 h-3" /> Search
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              Add <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal w-[30%]">Client</th>
                  <th className="pb-4 font-normal w-[20%]">Status</th>
                  <th className="pb-4 font-normal w-[25%]">Contact</th>
                  <th className="pb-4 font-normal">Projects</th>
                    <th className="pb-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.slice(0, 5).map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                          {client.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
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
<td className="py-5">
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.user_id && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[6px] font-bold">
                              U
                            </div>
                            <span className="text-[10px] text-emerald-600">Portal access</span>
                          </div>
                        )}
                      </td>
                      <td className="py-5 text-gray-600">{client.projects_count || 0}</td>
                    <td className="py-5 text-right">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Activity Chart (dark like Task Time) */}
        <div className="bg-[#222226] rounded-3xl p-8 relative flex flex-col shadow-lg overflow-hidden border border-white/5">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-gray-700/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-xl font-medium text-white">Client Growth</h3>
            <button className="text-sm text-gray-400 flex items-center gap-2 hover:text-white transition-colors">
              Monthly <ChevronRight className="w-3 h-3 rotate-90" />
            </button>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 relative z-10 pb-6">
            {["Jan", "Feb", "Mar", "Apr", "May"].map((month, idx) => {
              const values = [30, 45, 25, 60, 75];
              const isActive = idx === 4;
              return (
                <div key={month} className={`w-1/5 flex flex-col items-center gap-3 relative ${isActive ? "" : "group"}`}>
                  <div className={`text-xs absolute -top-6 font-medium ${isActive ? "text-white" : "text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"}`}>
                    {values[idx]} clients
                  </div>
                  <div className="w-full h-48 relative flex items-end justify-center">
                    {isActive && <div className="absolute inset-y-0 w-full bg-white/5 rounded-t-xl -z-10" />}
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg border-t-2 transition-all hover:bg-white/20 ${
                        isActive
                          ? "bg-gradient-to-t from-gray-800 to-gray-700 border-emerald-400 shadow-[0_-5px_15px_rgba(52,211,153,0.2)]"
                          : "bg-white/10 border-gray-400"
                      }`}
                      style={{ height: `${values[idx]}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? "text-white" : "text-gray-500"}`}>{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Cards matching dashboard bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2 pb-8">
        {/* Top Client Card */}
        <div className="rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg h-[280px]" style={{ background: "linear-gradient(135deg, #B4E6B0 0%, #85D480 100%)" }}>
          <div className="absolute bottom-0 right-0 w-full h-[60%] opacity-40 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(132, 212, 128, 0.3), transparent)", clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0% 100%)" }} />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5" /> Top Client
              </h3>
              {clients[0] && (
                <p className="text-gray-800/80 text-sm mt-2">{clients[0].name} — {clients[0].company}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm text-gray-800 flex items-center justify-center hover:bg-white/50 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="relative z-10 text-gray-800/80 text-sm max-w-[250px] mb-6 leading-relaxed font-medium">
            Your most valuable relationship. Reach out for a quarterly review.
          </p>
          <button className="relative z-10 bg-gray-900 text-white text-xs font-bold px-6 py-3 rounded-full w-max hover:bg-gray-800 transition-colors tracking-wide mt-auto">
            SEND EMAIL
          </button>
        </div>

        {/* Client Status Overview */}
        <div className="rounded-3xl p-8 relative flex flex-col shadow-lg overflow-hidden h-[280px]" style={{ background: "linear-gradient(135deg, #B4A2F0 0%, #9F8CE0 100%)" }}>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-medium text-gray-900">Status Overview</h3>
              <span className="px-2.5 py-1 bg-gray-900/10 text-gray-800 rounded-full text-xs font-medium">{clients.length} total</span>
            </div>
          </div>
          <div className="flex-1 relative z-10 flex flex-col justify-center gap-4">
            {[
              { label: "Active", value: active, color: "bg-emerald-400" },
              { label: "Leads", value: leads, color: "bg-blue-400" },
              { label: "Inactive", value: clients.filter((c) => c.status === "inactive").length, color: "bg-gray-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-800">{item.label}</div>
                <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${clients.length ? (item.value / clients.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-bold text-gray-900">{item.value}</div>
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
