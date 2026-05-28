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
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
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

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Follow-ups</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56"
            />
          </div>
        </div>

        {(searchQuery ? filtered : followUps).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarDays className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No follow-ups yet</p>
            <p className="text-sm text-gray-400 mt-1">Schedule reminders and outreach for your clients.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            >
              <Plus className="w-4 h-4" />
              Add Follow-up
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal">Client</th>
                  <th className="pb-4 font-normal">Type</th>
                  <th className="pb-4 font-normal">Scheduled</th>
                  <th className="pb-4 font-normal">Message</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(searchQuery ? filtered : followUps).map((followUp) => {
                  const client = clients.find((c) => c.id === followUp.client_id);
                  const colorClass = statusColors[followUp.status] || statusColors.pending;
                  return (
                    <tr key={followUp.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {(client?.name || followUp.clients?.name || "U").charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{client?.name || followUp.clients?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-5 text-gray-600 capitalize">{followUp.type.replace("_", " ")}</td>
                      <td className="py-5 text-gray-600">{followUp.scheduled_date}</td>
                      <td className="py-5 text-gray-500 max-w-xs truncate">{followUp.message || "—"}</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          {followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateStatus(followUp.id, "completed")}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            title="Mark Complete"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(followUp.id, "snoozed")}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                            title="Snooze"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingFollowUp(followUp)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingFollowUp(followUp)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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