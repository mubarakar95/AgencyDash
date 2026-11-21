"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, DollarSign, Search, Plus } from "lucide-react";

export default function TimeTrackingPage() {
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    project_id: "",
    team_member_id: "",
    description: "",
    hours: "",
    date: new Date().toISOString().split("T")[0],
    billable: true,
  });

  function fetchData() {
    setLoading(true);
    Promise.all([
      fetch("/api/time-entries").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/team").then((r) => r.json()),
    ])
      .then(([entriesData, projectsData, teamData]) => {
        setTimeEntries(entriesData || []);
        setProjects(projectsData || []);
        setTeam(teamData || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hours: parseFloat(formData.hours) || 0,
        }),
      });
      if (res.ok) {
        setFormData({
          project_id: "",
          team_member_id: "",
          description: "",
          hours: "",
          date: new Date().toISOString().split("T")[0],
          billable: true,
        });
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to log time", error);
    }
  }

  const totalHours = timeEntries.reduce((acc, entry) => acc + (entry.hours || 0), 0);
  const billableHours = timeEntries.filter((e) => e.billable).reduce((acc, entry) => acc + (entry.hours || 0), 0);

  const filtered = timeEntries.filter((e) => {
    const projectName = e.projects?.name || "";
    const memberName = e.team_members?.name || "";
    return (
      projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const displayEntries = searchQuery ? filtered : timeEntries;

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Time Tracking</h1>
          <span className="text-sm text-gray-500">{timeEntries.length} entries</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log Time
        </button>
      </header>

      {/* Compact KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-2 mb-6 shrink-0">
        <div className="bg-[#1a1a1e] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Hours</span>
            <span className="text-lg font-bold text-white">{totalHours.toFixed(1)}h</span>
          </div>
          <Clock className="w-4 h-4 text-blue-400" />
        </div>

        <div className="bg-[#1a1a1e] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Billable Hours</span>
            <span className="text-lg font-bold text-emerald-400">{billableHours.toFixed(1)}h</span>
          </div>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="bg-[#1a1a1e] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Logged Entries</span>
            <span className="text-lg font-bold text-white">{timeEntries.length}</span>
          </div>
          <Calendar className="w-4 h-4 text-amber-400" />
        </div>
      </div>

      {showForm && (
        <div className="glass-panel p-6 rounded-3xl mx-2 mb-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Log Time Entry</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Project</label>
              <select
                required
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#222226]">{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Team Member</label>
              <select
                required
                value={formData.team_member_id}
                onChange={(e) => setFormData({ ...formData, team_member_id: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="">Select member</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#222226]">{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Hours</label>
              <input
                type="number"
                step="0.25"
                required
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <input
                type="text"
                placeholder="What was done?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                  className="w-4 h-4 rounded accent-white"
                />
                <span className="text-sm text-gray-300">Billable</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Time Entries</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {displayEntries.length} logged
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

        {displayEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Clock className="w-10 h-10 mb-3 text-gray-500" />
            <p className="text-base font-semibold text-white">No time entries yet</p>
            <p className="text-xs text-gray-500 mt-1">Log your first entry to start tracking time.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Project</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Member</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Description</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Hours</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {displayEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-gray-400 whitespace-nowrap">{entry.date}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-semibold text-white truncate max-w-[150px]">
                      {entry.projects?.name || "—"}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-gray-300 whitespace-nowrap">{entry.team_members?.name || "—"}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-gray-400 max-w-[200px] truncate">{entry.description || "—"}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-white text-right whitespace-nowrap">{entry.hours}h</td>
                    <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        entry.billable
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-white/5 text-gray-400 border-white/10"
                      }`}>
                        {entry.billable ? "Billable" : "Non-billable"}
                      </span>
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