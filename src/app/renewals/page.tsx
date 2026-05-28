"use client";

import { useEffect, useState } from "react";
import { NewRenewalModal } from "@/components/modals/NewRenewalModal";
import { EditRenewalModal } from "@/components/modals/EditRenewalModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  Globe,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Flame,
  Pencil,
  Trash2,
} from "lucide-react";

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRenewal, setEditingRenewal] = useState<any>(null);
  const [deletingRenewal, setDeletingRenewal] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function fetchRenewals() {
    setLoading(true);
    fetch("/api/renewals")
      .then((res) => res.json())
      .then((data) => {
        setRenewals(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchRenewals();
  }, []);

  const filtered = renewals.filter(
    (r) =>
      r.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.provider || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalCount = renewals.filter((r) => r.status === "critical" || r.status === "expired").length;

  function getDaysUntil(date: string) {
    if (!date) return 0;
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  async function handleDeleteRenewal() {
    if (!deletingRenewal) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/renewals?id=${deletingRenewal.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete asset");
      setDeletingRenewal(null);
      fetchRenewals();
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

  const displayRenewals = searchQuery ? filtered : renewals;

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Renewals</h1>
          <span className="text-sm text-gray-500">{renewals.length} assets</span>
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium">
              <Flame className="w-3 h-3" /> {criticalCount} critical
            </span>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </header>

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Asset Directory</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
            />
          </div>
        </div>

        {displayRenewals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
            <Globe className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No assets found</p>
            <p className="text-sm text-gray-400 mt-1">Add your first domain, hosting, or license to start tracking.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal">Asset</th>
                  <th className="pb-4 font-normal">Type</th>
                  <th className="pb-4 font-normal">Provider</th>
                  <th className="pb-4 font-normal">Expiry</th>
                  <th className="pb-4 font-normal">Days Left</th>
                  <th className="pb-4 font-normal">Cost</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {displayRenewals.map((renewal) => {
                  const daysLeft = getDaysUntil(renewal.expiry_date);
                  const statusColors =
                    renewal.status === "safe"
                      ? "bg-green-100 text-green-700"
                      : renewal.status === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : renewal.status === "critical"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600";

                  return (
                    <tr key={renewal.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors group">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {renewal.asset_name?.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-gray-900">{renewal.asset_name}</p>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="text-xs text-gray-600 capitalize">{renewal.type}</span>
                      </td>
                      <td className="py-5 text-gray-600">{renewal.provider || "—"}</td>
                      <td className="py-5 text-gray-600">
                        {renewal.expiry_date ? new Date(renewal.expiry_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-5">
                        <span className={`text-xs font-medium ${daysLeft < 0 ? "text-red-500" : daysLeft < 30 ? "text-red-500" : daysLeft < 90 ? "text-amber-500" : "text-emerald-500"}`}>
                          {daysLeft < 0 ? "Expired" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                        </span>
                      </td>
                      <td className="py-5 font-medium text-gray-900">${renewal.cost || 0}</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors}`}>
                          {renewal.status === "critical" ? "Critical" : renewal.status === "warning" ? "Warning" : renewal.status === "expired" ? "Expired" : "Safe"}
                        </span>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingRenewal(renewal)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRenewal(renewal)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
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

      <NewRenewalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRenewals}
      />

      {editingRenewal && (
        <EditRenewalModal
          isOpen={!!editingRenewal}
          onClose={() => setEditingRenewal(null)}
          onSuccess={fetchRenewals}
          renewal={editingRenewal}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingRenewal}
        onClose={() => setDeletingRenewal(null)}
        onConfirm={handleDeleteRenewal}
        title="Delete Asset"
        message={`Are you sure you want to delete "${deletingRenewal?.asset_name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}