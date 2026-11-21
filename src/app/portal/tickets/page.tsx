"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  MessageSquare,
  Search,
  ChevronRight,
  ArrowLeft,
  Send,
  Clock,
  AlertTriangle,
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

export default function PortalTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: "", description: "", project_id: "", priority: "medium" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetch("/api/portal/tickets"), fetch("/api/portal/projects")])
      .then(([tRes, pRes]) => Promise.all([tRes.json(), pRes.json()]))
      .then(([tData, pData]) => {
        setTickets(Array.isArray(tData) ? tData : []);
        setProjects(Array.isArray(pData) ? pData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function selectTicket(ticket: any) {
    setSelectedTicket(ticket);
    fetch(`/api/ticket-comments?ticket_id=${ticket.id}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => setComments([]));
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
          author_name: "Client",
          author_role: "client",
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

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const body: any = {
        title: ticketForm.title,
        description: ticketForm.description,
        priority: ticketForm.priority,
        status: "open",
      };
      if (ticketForm.project_id) body.project_id = ticketForm.project_id;

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create ticket");

      setTicketForm({ title: "", description: "", project_id: "", priority: "medium" });
      setShowNewTicket(false);
      const data = await fetch("/api/tickets");
      setTickets(await data.json());
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }

  const filtered = tickets.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="w-full flex flex-col min-h-full pr-2 pb-16">
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge[selectedTicket.status] || "bg-gray-100 text-gray-600"}`}>
              {selectedTicket.status === "in_progress" ? "In Progress" : selectedTicket.status?.charAt(0).toUpperCase() + selectedTicket.status?.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityBadge[selectedTicket.priority] || "bg-gray-100 text-gray-600"}`}>
              {selectedTicket.priority?.charAt(0).toUpperCase() + selectedTicket.priority?.slice(1)}
            </span>
          </div>
        </header>

        <div className="glass-panel rounded-3xl p-6 mx-2 border border-white/5">
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            {selectedTicket.description || "No description provided."}
          </p>
          <div className="text-xs text-gray-500 flex items-center gap-4 pb-6 border-b border-white/10">
            <span>Project: {selectedTicket.projects?.name || "None"}</span>
            <span>Created: {new Date(selectedTicket.created_at).toLocaleDateString()}</span>
          </div>

          <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto">
            {comments.map((c: any) => (
              <div key={c.id} className={`flex gap-3 ${c.author_role === "client" ? "" : "flex-row-reverse"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  c.author_role === "admin"
                    ? "bg-gradient-to-br from-purple-400 to-pink-500 text-white"
                    : "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                }`}>
                  {c.author_name?.charAt(0) || "A"}
                </div>
                <div className={`max-w-md ${c.author_role === "client" ? "" : "text-right"}`}>
                  <div className={`flex items-center gap-2 mb-1 ${c.author_role === "client" ? "" : "justify-end"}`}>
                    <span className="text-sm font-medium text-white">{c.author_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{c.author_role === "admin" ? "Support" : "You"}</span>
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
              <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
            <input
              type="text"
              placeholder="Type a message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addComment()}
              className="flex-1 px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button
              onClick={addComment}
              disabled={commentLoading || !newComment.trim()}
              className="p-2.5 rounded-xl bg-white text-gray-900 hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Support Tickets</h1>
          <span className="text-sm text-gray-500">{tickets.length} tickets</span>
        </div>
        <button
          onClick={() => setShowNewTicket(!showNewTicket)}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </header>

      {showNewTicket && (
        <div className="glass-panel p-6 rounded-3xl mx-2 mb-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Submit a Ticket</h3>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{formError}</div>
          )}
          <form onSubmit={createTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={ticketForm.title}
                onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="What do you need help with?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none"
                placeholder="Describe your issue or request..."
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
                {formLoading ? "Creating..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Your Tickets</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-48"
            />
          </div>
        </div>

        {(searchQuery ? filtered : tickets).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Ticket className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No tickets yet</p>
            <p className="text-sm text-gray-400 mt-1">Submit a ticket to get help from our team.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal">Subject</th>
                  <th className="pb-4 font-normal">Priority</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal">Date</th>
                  <th className="pb-4 font-normal w-10"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(searchQuery ? filtered : tickets).map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => selectTicket(ticket)}>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <p className="font-medium text-gray-900">{ticket.title}</p>
                      </div>
                    </td>
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
                      <ChevronRight className="w-4 h-4 text-gray-300" />
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