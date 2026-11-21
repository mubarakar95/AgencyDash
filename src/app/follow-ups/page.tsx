"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PauseCircle, CalendarDays, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { NewFollowUpModal } from "@/components/modals/NewFollowUpModal";
import { EditFollowUpModal } from "@/components/modals/EditFollowUpModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [deletingFollowUp, setDeletingFollowUp] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchData() {
    try {
      const [followUpsRes, clientsRes] = await Promise.all([
        fetch("/api/follow-ups"),
        fetch("/api/clients"),
      ]);
      setFollowUps(await followUpsRes.json());
      setClients(await clientsRes.json());
    } catch (error) {
      console.error("Failed to fetch follow-ups", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await fetch("/api/follow-ups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setFollowUps((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
    } catch (error) {
      console.error("Failed to update follow-up", error);
    }
  }

  async function handleDelete() {
    if (!deletingFollowUp) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/follow-ups?id=${deletingFollowUp.id}`, { method: "DELETE" });
      setFollowUps((prev) => prev.filter((f) => f.id !== deletingFollowUp.id));
      setDeletingFollowUp(null);
    } catch (error) {
      console.error("Failed to delete follow-up", error);
    } finally {
      setDeleteLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    sent: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    snoozed: "bg-gray-100 text-gray-600",
  };

  const filtered = followUps.filter((f) => {
    const client = clients.find((c) => c.id === f.client_id);
    const name = client?.name || f.clients?.name || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pendingCount = followUps.filter((f) => f.status === "pending").length;
  const completedCount = followUps.filter((f) => f.status === "completed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Follow-ups</h1>
          <span className="text-sm text-gray-500">{followUps.length} total</span>
          {pendingCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
              {pendingCount} pending
            </span>
          )}
          {completedCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
              {completedCount} done
            </span>
          )}
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        >
          <Plus className="w-4 h-4" />
          Add Follow-up
        </button>
      </header>

      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Scheduled Follow-ups</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {(searchQuery ? filtered : followUps).length} items
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#222226] border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 w-56"
            />
          </div>
        </div>

        {(searchQuery ? filtered : followUps).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarDays className="w-10 h-10 mb-3 text-gray-500" />
            <p className="text-base font-semibold text-white">No follow-ups yet</p>
            <p className="text-xs text-gray-500 mt-1">Schedule reminders and outreach for your clients.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Follow-up
            </button>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Client</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Scheduled Date</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Note / Message</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {(searchQuery ? filtered : followUps).map((followUp) => {
                  const client = clients.find((c) => c.id === followUp.client_id);
                  const isPending = followUp.status === "pending";
                  const isCompleted = followUp.status === "completed";
                  const isSnoozed = followUp.status === "snoozed";

                  return (
                    <tr key={followUp.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                            {(client?.name || followUp.clients?.name || "U").charAt(0)}
                          </div>
                          <span className="font-semibold text-white truncate max-w-[150px]">
                            {client?.name || followUp.clients?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-300 capitalize whitespace-nowrap">
                        {followUp.type.replace("_", " ")}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-400 whitespace-nowrap">
                        {followUp.scheduled_date}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-300 max-w-[220px] truncate">
                        {followUp.message || "—"}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : isPending
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : isSnoozed
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-white/5 text-gray-400 border-white/10"
                        }`}>
                          {followUp.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {!isCompleted && (
                            <button
                              onClick={() => updateStatus(followUp.id, "completed")}
                              className="p-1 rounded-lg hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-colors"
                              title="Mark Complete"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => updateStatus(followUp.id, isSnoozed ? "pending" : "snoozed")}
                            className="p-1 rounded-lg hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-colors"
                            title={isSnoozed ? "Un-snooze" : "Snooze"}
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingFollowUp(followUp)}
                            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingFollowUp(followUp)}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewFollowUpModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={fetchData}
      />

      {editingFollowUp && (
        <EditFollowUpModal
          isOpen={!!editingFollowUp}
          onClose={() => setEditingFollowUp(null)}
          onSuccess={fetchData}
          followUp={editingFollowUp}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingFollowUp}
        onClose={() => setDeletingFollowUp(null)}
        onConfirm={handleDelete}
        title="Delete Follow-up"
        message={`Are you sure you want to delete this ${deletingFollowUp?.type?.replace("_", " ") || "follow-up"} follow-up${deletingFollowUp?.scheduled_date ? ` scheduled for ${deletingFollowUp.scheduled_date}` : ""}?`}
        loading={deleteLoading}
      />
    </div>
  );
}