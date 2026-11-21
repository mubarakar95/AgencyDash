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
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
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

      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Asset Directory</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {displayRenewals.length} assets
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#222226] border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 w-60"
            />
          </div>
        </div>

        {displayRenewals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Globe className="w-10 h-10 mb-3 text-gray-500" />
            <p className="text-base font-semibold text-white">No assets found</p>
            <p className="text-xs text-gray-500 mt-1">Add your first domain, hosting, or license to start tracking.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Asset
            </button>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Asset</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Type & Provider</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Expiry</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Days Left</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Cost</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {displayRenewals.map((renewal) => {
                  const daysLeft = getDaysUntil(renewal.expiry_date);
                  const statusColors =
                    renewal.status === "safe"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : renewal.status === "warning"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : renewal.status === "critical"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-white/5 text-gray-400 border-white/10";

                  return (
                    <tr key={renewal.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                            {renewal.asset_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-[220px]">
                            {renewal.asset_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <span className="text-gray-300 capitalize">{renewal.type}</span>
                        {renewal.provider && (
                          <span className="text-[10px] text-gray-500 block truncate max-w-[150px]">
                            via {renewal.provider}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-400 whitespace-nowrap">
                        {renewal.expiry_date ? new Date(renewal.expiry_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold ${
                          daysLeft < 0 ? "text-red-400" : daysLeft < 30 ? "text-red-400" : daysLeft < 90 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {daysLeft < 0 ? "Expired" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-semibold text-white whitespace-nowrap">
                        ${renewal.cost || 0}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${statusColors}`}>
                          {renewal.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingRenewal(renewal)}
                            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRenewal(renewal)}
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