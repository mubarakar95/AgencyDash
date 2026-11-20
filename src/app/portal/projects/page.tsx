"use client";

import { useEffect, useState } from "react";
import { FolderOpen, CalendarDays, CheckCircle2, Search } from "lucide-react";

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/portal/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    "in-progress": "bg-amber-100 text-amber-700",
    review: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    maintenance: "bg-cyan-100 text-cyan-700",
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 pb-6">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">My Projects</h1>
          <span className="text-sm text-gray-500">{projects.length} projects</span>
        </div>
      </header>

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Projects</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56"
            />
          </div>
        </div>

        {(searchQuery ? filtered : projects).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FolderOpen className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No projects yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[560px] scrollbar-light overscroll-x-contain">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white z-10 shadow-xs">
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 pt-1 font-normal bg-white">Project</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Status</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Progress</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Deadline</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Budget</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(searchQuery ? filtered : projects).map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {project.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <p className="text-xs text-gray-500">{project.clients?.name || project.client || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status] || "bg-gray-100 text-gray-600"}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-5 text-gray-600">{project.deadline || "TBD"}</td>
                    <td className="py-5 font-medium text-gray-900">${(project.budget || 0).toLocaleString()}</td>
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