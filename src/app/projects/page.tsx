"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NewProjectModal } from "@/components/modals/NewProjectModal";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  FolderOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  ArrowUpRight,
} from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "planning" | "completed">("all");

  function fetchProjects() {
    setLoading(true);
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "in_progress") return p.status === "in_progress";
    if (statusFilter === "planning") return p.status === "planning";
    if (statusFilter === "completed") return p.status === "completed" || p.status === "delivered";
    return true;
  });

  async function handleDeleteProject() {
    if (!deletingProject) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/projects?id=${deletingProject.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      setDeletingProject(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  const statusBadge: Record<string, string> = {
    planning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    delivered: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full px-2 sm:px-4 py-4 pb-16">
      {/* Top Header & Operational Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Projects</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium">
                {filteredProjects.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Active delivery pipelines, milestones, and budgets.</p>
          </div>
        </div>

        {/* Filter pills + Add Project Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-[#1a1a1e] border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "all" ? "bg-white text-gray-900 font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "in_progress" ? "bg-white text-gray-900 font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("planning")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "planning" ? "bg-white text-gray-900 font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "completed" ? "bg-white text-gray-900 font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              Completed
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#1a1a1e] border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors w-52 sm:w-64"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-gray-900 text-xs font-bold hover:scale-105 transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </header>

      {/* Main Single-Sight Projects Table */}
      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/5 bg-[#222226]/60">
                <th className="py-3 px-3 sm:px-4 font-semibold">Project & Client</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">Status</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">Progress</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">Budget</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">Deadline</th>
                <th className="py-3 px-3 sm:px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-white/5">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No projects found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    {/* Project & Client */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        {project.icon_url ? (
                          <img src={project.icon_url} alt={project.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                            {project.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1 text-xs sm:text-sm truncate">
                            {project.name}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 shrink-0" />
                          </p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {project.clients?.name || project.client || "No client specified"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusBadge[project.status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                        {project.status?.replace("_", " ")}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5 min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 w-8 text-right">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-3 sm:px-4 font-semibold text-white whitespace-nowrap">
                      ₹{(project.budget || 0).toLocaleString()}
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-3 sm:px-4 text-gray-400 whitespace-nowrap">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 sm:px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {project.quotation_url && (
                          <a
                            href={project.quotation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                            title="View quotation"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setEditingProject(project)}
                          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Edit project"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProject(project)}
                          className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />

      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={fetchProjects}
          project={editingProject}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone and will also delete all related time entries.`}
        loading={deleteLoading}
      />
    </div>
  );
}
