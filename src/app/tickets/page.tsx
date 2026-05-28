"use client";

import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { NewTaskModal } from "@/components/modals/NewTaskModal";
import {
  Ticket,
  Search,
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Link2,
  ClipboardList,
  ExternalLink,
} from "lucide-react";

const statusBadge: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const priorityBadge: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const taskStatusBadge: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-700",
  todo: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  review: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const taskStatusDark: Record<string, string> = {
  backlog: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  todo: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  review: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  done: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingTicket, setDeletingTicket] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    project_id: "",
    priority: "medium",
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [linkedTask, setLinkedTask] = useState<any>(null);
  const [showNewTaskFromTicket, setShowNewTaskFromTicket] = useState(false);

  function fetchTickets() {
    setLoading(true);
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchTickets();
    fetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
    fetch("/api/clients").then((r) => r.json()).then(setClients).catch(() => {});
  }, []);

  function selectTicket(ticket: any) {
    setSelectedTicket(ticket);
    fetch(`/api/ticket-comments?ticket_id=${ticket.id}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => setComments([]));
    fetch(`/api/tasks?ticket_id=${ticket.id}`)
      .then((r) => r.json())
      .then((data) => {
        setLinkedTask(data && data.length > 0 ? data[0] : null);
      })
      .catch(() => setLinkedTask(null));
  }

  async function addComment() {
    if (!newComment.trim() || !selectedTicket) return;
    setCommentLoading(true);
    try {
      const res = await fetch("/api/ticket-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          author_name: "Admin",
          author_role: "admin",
          content: newComment.trim(),
        }),
      });
      if (res.ok) {
        setNewComment("");
        const c = await fetch(`/api/ticket-comments?ticket_id=${selectedTicket.id}`);
        setComments(await c.json());
      }
    } finally {
      setCommentLoading(false);
    }
  }

  async function updateStatus(ticketId: string, status: string) {
    const res = await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated);
      }
    }
  }

  async function handleDelete() {
    if (!deletingTicket) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/tickets?id=${deletingTicket.id}`, { method: "DELETE" });
      setDeletingTicket(null);
      fetchTickets();
    } finally {
      setDeleteLoading(false);
    }
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const client = clients[0]; // default to first client
      const body: any = {
        title: ticketForm.title,
        description: ticketForm.description,
        priority: ticketForm.priority,
        status: "open",
      };
      if (ticketForm.project_id) body.project_id = ticketForm.project_id;
      if (client?.id) body.client_id = client.id;

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      setTicketForm({ title: "", description: "", project_id: "", priority: "medium" });
      setShowNewTicket(false);
      fetchTickets();
    } catch (err: any) {
      setFormError(err.message || "Failed to create ticket");
    } finally {
      setFormLoading(false);
    }
  }

  const filtered = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.projects?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
        <header className="flex justify-between items-center py-4 px-2 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-white">{selectedTicket.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {["open", "in_progress", "resolved", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(selectedTicket.id, s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTicket.status === s
                    ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-2 flex-1">
          <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedTicket.description || "No description provided."}
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityBadge[selectedTicket.priority] || "bg-gray-100 text-gray-600"}`}>
                  {selectedTicket.priority?.charAt(0).toUpperCase() + selectedTicket.priority?.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedTicket.projects?.name || "No project"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(selectedTicket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {comments.map((c: any) => (
                  <div key={c.id} className={`flex gap-3 ${c.author_role === "client" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      c.author_role === "admin" ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white" : "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                    }`}>
                      {c.author_name?.charAt(0) || "A"}
                    </div>
                    <div className={`max-w-md ${c.author_role === "client" ? "text-right" : ""}`}>
                      <div className={`flex items-center gap-2 mb-1 ${c.author_role === "client" ? "justify-end" : ""}`}>
                        <span className="text-sm font-medium text-white">{c.author_name}</span>
                        <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                        c.author_role === "admin"
                          ? "bg-[#222226] text-gray-200"
                          : "bg-emerald-500/20 text-emerald-100"
                      }`}>
                        {c.content}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No comments yet.</p>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addComment()}
                  className="flex-1 px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                />
                <button
                  onClick={addComment}
                  disabled={commentLoading || !newComment.trim()}
                  className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[selectedTicket.status] || "bg-gray-100 text-gray-600"}`}>
                    {selectedTicket.status === "in_progress" ? "In Progress" : selectedTicket.status?.charAt(0).toUpperCase() + selectedTicket.status?.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Priority</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge[selectedTicket.priority] || "bg-gray-100 text-gray-600"}`}>
                    {selectedTicket.priority?.charAt(0).toUpperCase() + selectedTicket.priority?.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Project</span>
                  <span className="text-white">{selectedTicket.projects?.name || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Client</span>
                  <span className="text-white">{selectedTicket.clients?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">{new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Updated</span>
                  <span className="text-white">{new Date(selectedTicket.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                Linked Task
              </h3>
              {linkedTask ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">{linkedTask.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${taskStatusBadge[linkedTask.status] || "bg-gray-100 text-gray-600"}`}>
                      {linkedTask.status === "in_progress" ? "In Progress" : linkedTask.status === "todo" ? "To Do" : linkedTask.status?.charAt(0).toUpperCase() + linkedTask.status?.slice(1)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge[linkedTask.priority] || "bg-gray-100 text-gray-600"}`}>
                      {linkedTask.priority?.charAt(0).toUpperCase() + linkedTask.priority?.slice(1)}
                    </span>
                  </div>
                  {linkedTask.type && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white">{linkedTask.type.charAt(0).toUpperCase() + linkedTask.type.slice(1)}</span>
                    </div>
                  )}
                  {linkedTask.team_members?.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Assignee</span>
                      <span className="text-white">{linkedTask.team_members.name}</span>
                    </div>
                  )}
                  {linkedTask.due_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Due</span>
                      <span className={`text-white ${new Date(linkedTask.due_date) < new Date() && linkedTask.status !== "done" ? "text-red-400" : ""}`}>
                        {new Date(linkedTask.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  )}
                  <a
                    href="/tasks"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View in Tasks
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">No task linked yet</p>
                  <p className="text-xs text-gray-600 mb-4">Create a task to track work on this ticket</p>
                  <button
                    onClick={() => setShowNewTaskFromTicket(true)}
                    className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" /> Create Task from Ticket
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setDeletingTicket(selectedTicket);
              }}
              className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Ticket
            </button>
          </div>
        </div>

        <DeleteConfirmDialog
          isOpen={!!deletingTicket}
          onClose={() => setDeletingTicket(null)}
          onConfirm={handleDelete}
          title="Delete Ticket"
          message={`Are you sure you want to delete "${deletingTicket?.title}"? This action cannot be undone and will also delete all comments.`}
          loading={deleteLoading}
        />

        <NewTaskModal
          isOpen={showNewTaskFromTicket}
          onClose={() => setShowNewTaskFromTicket(false)}
          onSuccess={() => {
            if (selectedTicket) {
              fetch(`/api/tasks?ticket_id=${selectedTicket.id}`)
                .then((r) => r.json())
                .then((data) => {
                  setLinkedTask(data && data.length > 0 ? data[0] : null);
                })
                .catch(() => {});
            }
          }}
          preselectedTicketId={selectedTicket?.id}
          preselectedTicketData={selectedTicket ? {
            title: selectedTicket.title,
            description: selectedTicket.description || "",
            project_id: selectedTicket.project_id || "",
            priority: selectedTicket.priority || "medium",
          } : undefined}
          preselectedProjectId={selectedTicket?.project_id || undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Tickets</h1>
          <span className="text-sm text-gray-500">{tickets.length} total</span>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </header>

      {showNewTicket && (
        <div className="glass-panel p-6 rounded-3xl mx-2 mb-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Create Ticket</h3>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{formError}</div>
          )}
          <form onSubmit={createTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={ticketForm.title}
                onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Bug in login page"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none"
                placeholder="Describe the issue..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project</label>
                <select
                  value={ticketForm.project_id}
                  onChange={(e) => setTicketForm({ ...ticketForm, project_id: e.target.value })}
                  className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
                >
                  <option value="" className="bg-[#222226]">No project</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id} className="bg-[#222226]">{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        ticketForm.priority === p
                          ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                          : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTicket(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              >
                {formLoading ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">All Tickets</h3>
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

        {(searchQuery ? filtered : tickets).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Ticket className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No tickets yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a ticket to track issues and requests.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal">Ticket</th>
                  <th className="pb-4 font-normal">Project</th>
                  <th className="pb-4 font-normal">Priority</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal">Created</th>
                  <th className="pb-4 font-normal w-16"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(searchQuery ? filtered : tickets).map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    onClick={() => selectTicket(ticket)}
                  >
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ticket.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{ticket.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-gray-600">{ticket.projects?.name || "—"}</td>
                    <td className="py-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityBadge[ticket.priority] || "bg-gray-100 text-gray-600"}`}>
                        {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
                      </span>
                    </td>
                    <td className="py-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[ticket.status] || "bg-gray-100 text-gray-600"}`}>
                        {ticket.status === "in_progress" ? "In Progress" : ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-5 text-gray-500 text-xs">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="py-5">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}