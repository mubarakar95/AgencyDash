"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface EditFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  followUp: any;
}

const TYPES = ["proposal", "project_checkin", "renewal_notice", "invoice_reminder", "custom"];
const STATUSES = ["pending", "sent", "completed", "snoozed"];

export function EditFollowUpModal({ isOpen, onClose, onSuccess, followUp }: EditFollowUpModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    type: "call",
    scheduled_date: "",
    status: "pending",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/clients")
        .then((r) => r.json())
        .then((data) => setClients(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && followUp) {
      setFormData({
        client_id: followUp.client_id || "",
        type: followUp.type || "proposal",
        scheduled_date: followUp.scheduled_date || "",
        status: followUp.status || "pending",
        message: followUp.message || "",
      });
    }
  }, [isOpen, followUp]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = { ...formData, id: followUp.id };
      if (!body.client_id) body.client_id = null;
      if (!body.message) body.message = null;

      const res = await fetch("/api/follow-ups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update follow-up");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Follow-up">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client</label>
          <select
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
          >
            <option value="" className="bg-[#222226]">No client</option>
            {clients.map((c: any) => (
              <option key={c.id} value={c.id} className="bg-[#222226]">
                {c.name}{c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    formData.type === t
                      ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    formData.status === s
                      ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Scheduled Date *</label>
          <input
            type="date"
            required
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none"
            placeholder="Notes for this follow-up..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
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