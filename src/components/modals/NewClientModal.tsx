"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewClientModal({ isOpen, onClose, onSuccess }: NewClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead",
  });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedRenewals, setSelectedRenewals] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [clientProfiles, setClientProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => setProjects(Array.isArray(data) ? data : []))
        .catch(() => {});
      fetch("/api/renewals")
        .then((r) => r.json())
        .then((data) => setRenewals(Array.isArray(data) ? data : []))
        .catch(() => {});
      fetch("/api/profiles")
        .then((r) => r.json())
        .then((data) => setClientProfiles(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = { ...formData };
      if (selectedUserId) body.user_id = selectedUserId;

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      // Assign projects and renewals
      if ((selectedProjects.length > 0 || selectedRenewals.length > 0) && data.id) {
        await fetch("/api/clients", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.id,
            project_ids: selectedProjects,
            renewal_ids: selectedRenewals,
          }),
        });
      }

      setFormData({ name: "", email: "", phone: "", company: "", status: "lead" });
      setSelectedUserId("");
      setSelectedProjects([]);
      setSelectedRenewals([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggleProject(projectId: string) {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  }

  function toggleRenewal(renewalId: string) {
    setSelectedRenewals((prev) =>
      prev.includes(renewalId)
        ? prev.filter((id) => id !== renewalId)
        : [...prev, renewalId]
    );
  }

  const renewalTypeIcon: Record<string, string> = {
    domain: "🌐",
    hosting: "🖥️",
    ssl: "🔒",
    license: "📋",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Client" maxWidth="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="+1 555-0101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {["lead", "active", "inactive"].map((s) => (
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Linked User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="" className="bg-[#222226]">No linked user</option>
                {clientProfiles.map((p: any) => (
                  <option key={p.id} value={p.id} className="bg-[#222226]">
                    {p.full_name || p.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Users with role "client" — link for portal access</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Projects <span className="text-gray-500 font-normal">({selectedProjects.length})</span>
              </label>
              <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
                {projects.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No projects yet</p>
                ) : (
                  projects.map((project: any) => (
                    <label
                      key={project.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedProjects.includes(project.id)
                          ? "bg-white/10 border border-white/20"
                          : "bg-[#222226] border border-white/5 hover:border-white/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                        className="w-3.5 h-3.5 rounded border-gray-600 text-white focus:ring-white/20 bg-[#111111]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{project.name}</p>
                      </div>
                      {project.icon_url ? (
                        <img src={project.icon_url} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[7px] font-bold shrink-0">
                          {project.name?.charAt(0)}
                        </div>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Renewals <span className="text-gray-500 font-normal">({selectedRenewals.length})</span>
              </label>
              <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
                {renewals.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No renewals yet</p>
                ) : (
                  renewals.map((renewal: any) => (
                    <label
                      key={renewal.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedRenewals.includes(renewal.id)
                          ? "bg-white/10 border border-white/20"
                          : "bg-[#222226] border border-white/5 hover:border-white/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRenewals.includes(renewal.id)}
                        onChange={() => toggleRenewal(renewal.id)}
                        className="w-3.5 h-3.5 rounded border-gray-600 text-white focus:ring-white/20 bg-[#111111]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{renewal.asset_name}</p>
                        <p className="text-[10px] text-gray-500">{renewal.type} · ${renewal.cost || 0}</p>
                      </div>
                      <span className="text-xs shrink-0">{renewalTypeIcon[renewal.type] || "📄"}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-white/5">
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
            {loading ? "Adding..." : "Add Client"}
          </button>
        </div>
      </form>
    </Modal>
  );
}