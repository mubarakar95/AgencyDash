"use client";

import { useEffect, useState } from "react";
import { Users, Mail, FolderOpen, Search } from "lucide-react";

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        setTeam(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = team.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const displayTeam = searchQuery ? filtered : team;

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Team</h1>
          <span className="text-sm text-gray-500">{team.length} members</span>
        </div>
      </header>

      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Team Members</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {displayTeam.length} members
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#222226] border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 w-56"
            />
          </div>
        </div>

        {displayTeam.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-10 h-10 mb-3 text-gray-500" />
            <p className="text-base font-semibold text-white">No team members yet</p>
            <p className="text-xs text-gray-500 mt-1">Add developers and designers to your team.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Member</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Contact</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Role</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center">Projects</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {displayTeam.map((member) => {
                  const workloadColor =
                    (member.workload || 0) > 80
                      ? "bg-red-500"
                      : (member.workload || 0) > 60
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                  return (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <span className="font-semibold text-white">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{member.email}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-300 capitalize">{member.role}</td>
                      <td className="py-2.5 px-3 sm:px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-300 border border-white/10">
                          {member.active_projects || 0} active
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${workloadColor}`}
                              style={{ width: `${Math.min(100, member.workload || 0)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-gray-400">{member.workload || 0}%</span>
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
    </div>
  );
}