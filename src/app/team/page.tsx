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
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Team</h1>
          <span className="text-sm text-gray-500">{team.length} members</span>
        </div>
      </header>

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Team Members</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56"
            />
          </div>
        </div>

        {displayTeam.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No team members yet</p>
            <p className="text-sm text-gray-400 mt-1">Add developers and designers to your team.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal">Member</th>
                  <th className="pb-4 font-normal">Email</th>
                  <th className="pb-4 font-normal">Role</th>
                  <th className="pb-4 font-normal">Projects</th>
                  <th className="pb-4 font-normal">Workload</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {displayTeam.map((member) => {
                  const workloadColor =
                    (member.workload || 0) > 80
                      ? "bg-red-500"
                      : (member.workload || 0) > 60
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                  return (
                    <tr key={member.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {member.email}
                        </div>
                      </td>
                      <td className="py-5 text-gray-600">{member.role}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                          {member.active_projects || 0}
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${workloadColor}`}
                              style={{ width: `${Math.min(100, member.workload || 0)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500">{member.workload || 0}%</span>
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