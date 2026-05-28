"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface Renewal {
  id: string;
  asset_name: string;
  type: string;
  expiry_date: string;
  cost: number;
  provider: string | null;
  status: string;
  notes: string | null;
}

interface EditRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  renewal: Renewal | null;
}

export function EditRenewalModal({ isOpen, onClose, onSuccess, renewal }: EditRenewalModalProps) {
  const [formData, setFormData] = useState({
    asset_name: renewal?.asset_name || "",
    type: renewal?.type || "domain",
    expiry_date: renewal?.expiry_date || "",
    cost: renewal?.cost?.toString() || "",
    provider: renewal?.provider || "",
    status: renewal?.status || "safe",
    notes: renewal?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!renewal) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        id: renewal!.id,
        ...formData,
        cost: parseFloat(formData.cost) || 0,
      };

      if (!formData.notes.trim()) (body as any).notes = null;

      const res = await fetch("/api/renewals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update asset");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const statusOptions = [
    { value: "safe", label: "Safe", color: "emerald" },
    { value: "warning", label: "Warning", color: "amber" },
    { value: "critical", label: "Critical", color: "red" },
    { value: "expired", label: "Expired", color: "gray" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Asset">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Asset Name *</label>
          <input
            type="text"
            required
            value={formData.asset_name}
            onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
            className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setFormData({ ...formData, status: s.value })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  formData.status === s.value
                    ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
            >
              <option value="domain" className="bg-[#222226]">Domain</option>
              <option value="hosting" className="bg-[#222226]">Hosting</option>
              <option value="ssl" className="bg-[#222226]">SSL</option>
              <option value="license" className="bg-[#222226]">License</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date *</label>
            <input
              type="date"
              required
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Provider</label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Namecheap, AWS..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cost ($)</label>
            <input
              type="number"
              min="0"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="12.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none"
            placeholder="Auto-renewal info, login details..."
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}