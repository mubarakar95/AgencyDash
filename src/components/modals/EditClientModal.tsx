"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { Search, FolderKanban, RefreshCw, FileText } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  last_contact: string | null;
  notes: string | null;
  user_id: string | null;
}

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: Client | null;
}

export function EditClientModal({ isOpen, onClose, onSuccess, client }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead",
    notes: "",
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [selectedRenewals, setSelectedRenewals] = useState<string[]>([]);
  const [clientProfiles, setClientProfiles] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "renewals" | "invoices">("projects");
  const [searchProjects, setSearchProjects] = useState("");
  const [searchRenewals, setSearchRenewals] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        status: client.status || "lead",
        notes: client.notes || "",
      });
      setSelectedUserId(client.user_id || "");

      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => {
          const allProjects = Array.isArray(data) ? data : [];
          setProjects(allProjects);
          const assigned = allProjects
            .filter((p: any) => p.client_id === client.id)
            .map((p: any) => p.id);
          setSelectedProjects(assigned);
        })
        .catch(() => {});

      fetch("/api/renewals")
        .then((r) => r.json())
        .then((data) => {
          const allRenewals = Array.isArray(data) ? data : [];
          setRenewals(allRenewals);
          const assigned = allRenewals
            .filter((r: any) => r.client_id === client.id)
            .map((r: any) => r.id);
          setSelectedRenewals(assigned);
        })
        .catch(() => {});

      fetch("/api/invoices")
        .then((r) => r.json())
        .then((data) => {
          const allInvoices = Array.isArray(data) ? data : [];
          setInvoices(allInvoices.filter((inv: any) => inv.client_id === client.id));
        })
        .catch(() => {});

      fetch("/api/profiles")
        .then((r) => r.json())
        .then((data) => {
          setClientProfiles(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    }
  }, [isOpen, client]);

  if (!client) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = {
        id: client!.id,
        ...formData,
        project_ids: selectedProjects,
        renewal_ids: selectedRenewals,
      };
      if (selectedUserId) body.user_id = selectedUserId;
      else body.user_id = null;

      const res = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update client");

      onSuccess();
      onClose();
    } catch (err: any) {
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

  const statuses = [
    { value: "lead", label: "Lead" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Client" maxWidth="max-w-4xl">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-base text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-base text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="client@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="+1 555-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Linked User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
                >
                  <option value="" className="bg-[#222226]">No linked user</option>
                  {clientProfiles.map((p: any) => (
                    <option key={p.id} value={p.id} className="bg-[#222226]">
                      {p.full_name || p.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Link a client user account for portal access</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-y min-h-[80px]"
                  placeholder="Add notes about this client..."
                />
              </div>
            </div>

            <div className="flex flex-col min-h-0">
              <div className="flex border-b border-white/10 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "projects"
                      ? "border-white text-white"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  Projects
                  <span className="ml-1 text-xs bg-white/10 px-2 py-0.5 rounded-full">{selectedProjects.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("renewals")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "renewals"
                      ? "border-white text-white"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Renewals
                  <span className="ml-1 text-xs bg-white/10 px-2 py-0.5 rounded-full">{selectedRenewals.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("invoices")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "invoices"
                      ? "border-white text-white"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Invoices
                  <span className="ml-1 text-xs bg-white/10 px-2 py-0.5 rounded-full">{invoices.length}</span>
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === "projects" && (
                  <div className="h-full flex flex-col">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={searchProjects}
                        onChange={(e) => setSearchProjects(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full pl-9 pr-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                      {projects.length === 0 ? (
                        <p className="text-sm text-gray-500 py-8 text-center">No projects yet</p>
                      ) : (
                        projects
                          .filter((p: any) => p.name?.toLowerCase().includes(searchProjects.toLowerCase()))
                          .map((project: any) => (
                            <label
                              key={project.id}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                selectedProjects.includes(project.id)
                                  ? "bg-white/10 border border-white/20"
                                  : "bg-[#222226] border border-white/5 hover:border-white/10"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedProjects.includes(project.id)}
                                onChange={() => toggleProject(project.id)}
                                className="w-4 h-4 rounded border-gray-600 text-white focus:ring-white/20 bg-[#111111]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{project.name}</p>
                              </div>
                              {project.icon_url ? (
                                <img src={project.icon_url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                                  {project.name?.charAt(0)}
                                </div>
                              )}
                            </label>
                          ))
                      )}
                      {searchProjects && projects.filter((p: any) => p.name?.toLowerCase().includes(searchProjects.toLowerCase())).length === 0 && (
                        <p className="text-sm text-gray-500 py-8 text-center">No matching projects</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "renewals" && (
                  <div className="h-full flex flex-col">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={searchRenewals}
                        onChange={(e) => setSearchRenewals(e.target.value)}
                        placeholder="Search renewals..."
                        className="w-full pl-9 pr-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                      {renewals.length === 0 ? (
                        <p className="text-sm text-gray-500 py-8 text-center">No renewals yet</p>
                      ) : (
                        renewals
                          .filter((r: any) => r.asset_name?.toLowerCase().includes(searchRenewals.toLowerCase()))
                          .map((renewal: any) => (
                            <label
                              key={renewal.id}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                selectedRenewals.includes(renewal.id)
                                  ? "bg-white/10 border border-white/20"
                                  : "bg-[#222226] border border-white/5 hover:border-white/10"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedRenewals.includes(renewal.id)}
                                onChange={() => toggleRenewal(renewal.id)}
                                className="w-4 h-4 rounded border-gray-600 text-white focus:ring-white/20 bg-[#111111]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{renewal.asset_name}</p>
                                <p className="text-xs text-gray-500">{renewal.type} · ${renewal.cost || 0}</p>
                              </div>
                              <span className="text-sm shrink-0">{renewalTypeIcon[renewal.type] || "📄"}</span>
                            </label>
                          ))
                      )}
                      {searchRenewals && renewals.filter((r: any) => r.asset_name?.toLowerCase().includes(searchRenewals.toLowerCase())).length === 0 && (
                        <p className="text-sm text-gray-500 py-8 text-center">No matching renewals</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "invoices" && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-400">All invoices for this client</p>
                      <button
                        type="button"
                        onClick={() => setShowNewInvoice(true)}
                        className="text-sm text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        + New Invoice
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                      {invoices.length === 0 ? (
                        <p className="text-sm text-gray-500 py-8 text-center">No invoices yet</p>
                      ) : (
                        invoices.map((inv: any) => {
                          const statusColors: Record<string, string> = {
                            draft: "text-gray-400",
                            sent: "text-blue-400",
                            paid: "text-emerald-400",
                            overdue: "text-red-400",
                          };
                          return (
                            <a
                              key={inv.id}
                              href={`/invoices/${inv.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl bg-[#222226] border border-white/5 hover:border-white/10 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{inv.invoice_number}</p>
                                <p className="text-xs text-gray-500">{inv.projects?.name || "No project"}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-medium text-white">${Number(inv.amount || 0).toFixed(2)}</p>
                                <p className={`text-xs ${statusColors[inv.status] || "text-gray-500"}`}>
                                  {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                                </p>
                              </div>
                            </a>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <NewInvoiceModal
        isOpen={showNewInvoice}
        onClose={() => setShowNewInvoice(false)}
        onSuccess={() => {
          setShowNewInvoice(false);
          fetch("/api/invoices")
            .then((r) => r.json())
            .then((data) => {
              const allInvoices = Array.isArray(data) ? data : [];
              setInvoices(allInvoices.filter((inv: any) => inv.client_id === client?.id));
            })
            .catch(() => {});
        }}
        preselectedClientId={client?.id}
      />
    </Modal>
  );
}
