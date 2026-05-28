"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NewProjectModal } from "@/components/modals/NewProjectModal";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  FolderOpen,
  CalendarDays,
  DollarSign,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Sparkles,
  Zap,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function fetchProjects() {
    setLoading(true);
    Promise.all([
      fetch("/api/projects"),
      fetch("/api/tasks"),
    ])
      .then(([projectsRes, tasksRes]) => Promise.all([projectsRes.json(), tasksRes.json()]))
      .then(([projectsData, tasksData]) => {
        setProjects(projectsData || []);
        setTasks(tasksData || []);
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

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.clients?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = projects.filter((p) => p.status !== "delivered" && p.status !== "completed").length;
  const completedCount = projects.filter((p) => p.status === "delivered" || p.status === "completed").length;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  const projectTaskCounts = projects.map((p) => {
    const projectTasks = tasks.filter((t: any) => t.project_id === p.id);
    const pending = projectTasks.filter((t: any) => t.status === "backlog" || t.status === "todo").length;
    const active = projectTasks.filter((t: any) => t.status === "in_progress").length;
    const inReview = projectTasks.filter((t: any) => t.status === "review").length;
    return { ...p, taskCount: projectTasks.length, pendingTasks: pending, activeTasks: active, reviewTasks: inReview };
  });

  const projectsWithAttention = projectTaskCounts
    .filter((p) => p.status !== "delivered" && p.status !== "completed" && p.taskCount > 0)
    .sort((a, b) => (b.pendingTasks + b.activeTasks) - (a.pendingTasks + a.activeTasks))
    .slice(0, 4);

  const statusBadge: Record<string, string> = {
    lead: "bg-gray-100 text-gray-700",
    quoted: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    "in-progress": "bg-amber-100 text-amber-700",
    review: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    maintenance: "bg-cyan-100 text-cyan-700",
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
          <span className="text-sm text-gray-500">{projects.length} total</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </header>

      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 px-2 gap-6">
        <div className="flex-1">
          <h2 className="text-4xl font-semibold mb-3 tracking-tight text-white">
            Manage Projects
          </h2>
          <p className="text-gray-400 text-lg">Track progress, budgets, and deadlines across all active work.</p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="min-w-[60px] h-[72px] bg-white rounded-2xl flex items-center justify-center text-gray-900 text-xl font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform shrink-0"
          >
            <Plus className="w-6 h-6" />
          </button>
          <div className="glass-panel min-w-[200px] h-[72px] rounded-2xl flex items-center justify-between px-5 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Active</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{activeCount} in progress</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          <div className="glass-panel min-w-[200px] h-[72px] rounded-2xl flex items-center justify-between px-5 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{completedCount} delivered</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-2 pb-6">
        <div className="widget-shape-light p-8 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-medium text-gray-900">Project Directory</h3>
              <div className="h-4 w-px bg-gray-300" />
              <span className="text-sm text-gray-500">{projects.length} projects</span>
            </div>
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

          <div className="flex-1 overflow-x-auto">
            {(searchQuery ? filteredProjects : projects).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FolderOpen className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">No projects found</p>
                <p className="text-sm text-gray-400 mt-1">Create your first project to get started.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-4 font-normal">Project</th>
                    <th className="pb-4 font-normal">Status</th>
                    <th className="pb-4 font-normal">Progress</th>
                    <th className="pb-4 font-normal">Budget</th>
                    <th className="pb-4 font-normal">Deadline</th>
                    <th className="pb-4 font-normal w-10"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
{(searchQuery ? filteredProjects : projects).map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          {project.icon_url ? (
                            <img src={project.icon_url} alt={project.name} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {project.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{project.name}</p>
                            <p className="text-xs text-gray-500">{project.clients?.name || project.client || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge[project.status] || "bg-gray-100 text-gray-600"}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500">{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-5 font-medium text-gray-900">${(project.budget || 0).toLocaleString()}</td>
                      <td className="py-5 text-gray-600">{project.deadline || "—"}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {project.quotation_url && (
                            <a
                              href={project.quotation_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                              title="View quotation"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Edit project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingProject(project); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-[#222226] rounded-3xl p-8 relative flex flex-col shadow-lg overflow-hidden border border-white/5">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-xl font-medium text-white">Project Health</h3>
            <span className="text-sm text-gray-400">{avgProgress}% avg</span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 relative z-10">
            <div className="glass-panel rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400">Active</span>
              </div>
              <p className="text-3xl font-bold text-white">{activeCount}</p>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${projects.length ? (activeCount / projects.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Done</span>
              </div>
              <p className="text-3xl font-bold text-white">{completedCount}</p>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${projects.length ? (completedCount / projects.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Budget</span>
              </div>
              <p className="text-2xl font-bold text-white">${(totalBudget / 1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-500 mt-1">total value</p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">On Track</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {projects.length > 0 ? Math.round((projects.filter(p => (p.progress || 0) >= 50).length / projects.length) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">above 50%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2 pb-8">
        <div className="rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg h-[280px]" style={{ background: "linear-gradient(135deg, #BBF7D0 0%, #6EE7B7 100%)" }}>
          <div className="absolute bottom-0 right-0 w-full h-[60%] opacity-30 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(16,185,129,0.3), transparent)", clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0% 100%)" }} />
          <div className="relative z-10 flex justify-between items-start mb-3">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Active Tasks
              </h3>
              <p className="text-gray-800/80 text-sm mt-2">Projects needing attention</p>
            </div>
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-2">
            {projectsWithAttention.length > 0 ? projectsWithAttention.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-900 truncate">{p.name}</div>
                <div className="flex-1 flex items-center gap-2">
                  {p.activeTasks > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{p.activeTasks} active</span>
                  )}
                  {p.pendingTasks > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{p.pendingTasks} pending</span>
                  )}
                  {p.reviewTasks > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{p.reviewTasks} review</span>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-700/70">No active tasks across projects</p>
            )}
          </div>
          <button
            onClick={() => router.push("/tasks")}
            className="relative z-10 bg-gray-900 text-white text-xs font-bold px-6 py-3 rounded-full w-max hover:bg-gray-800 transition-colors tracking-wide mt-auto"
          >
            VIEW ALL TASKS
          </button>
        </div>

        <div className="rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg h-[280px]" style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)" }}>
          <div className="absolute bottom-0 right-0 w-full h-[60%] opacity-30 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(139,92,246,0.3), transparent)", clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0% 100%)" }} />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Budget Overview
              </h3>
              <p className="text-gray-800/80 text-sm mt-2">${(totalBudget / 1000).toFixed(1)}k total across all projects</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-full">
              <DollarSign className="w-4 h-4 text-gray-900" />
              <span className="text-sm font-bold text-gray-900">{projects.length} projects</span>
            </div>
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
            {projects.slice(0, 4).map((p) => {
              const maxBudget = Math.max(...projects.map((pr) => pr.budget || 0), 1);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-gray-900 truncate">{p.name}</div>
                  <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gray-900" style={{ width: `${((p.budget || 0) / maxBudget) * 100}%` }} />
                  </div>
                  <div className="w-16 text-right text-sm font-bold text-gray-900">${((p.budget || 0) / 1000).toFixed(0)}k</div>
                </div>
              );
            })}
          </div>
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