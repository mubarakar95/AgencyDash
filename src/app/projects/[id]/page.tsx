"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { NewTaskModal } from "@/components/modals/NewTaskModal";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import {
  ArrowLeft,
  FolderOpen,
  Plus,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Pencil,
  Trash2,
  FileText,
  Timer,
} from "lucide-react";

const statusColors: Record<string, string> = {
  lead: "bg-gray-100 text-gray-700",
  quoted: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  "in-progress": "bg-amber-100 text-amber-700",
  review: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  maintenance: "bg-cyan-100 text-cyan-700",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deletingTask, setDeletingTask] = useState<any>(null);
  const [taskDeleteLoading, setTaskDeleteLoading] = useState(false);

  function fetchData() {
    setLoading(true);
    Promise.all([
      fetch(`/api/projects`).then((r) => r.json()),
      fetch(`/api/tasks?project_id=${projectId}`).then((r) => r.json()),
    ])
      .then(([pData, tData]) => {
        const proj = (Array.isArray(pData) ? pData : []).find((p: any) => p.id === projectId);
        setProject(proj || null);
        setTasks(Array.isArray(tData) ? tData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  async function handleStatusChange(taskId: string, newStatus: string) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    }
  }

  async function handleTaskDelete() {
    if (!deletingTask) return;
    setTaskDeleteLoading(true);
    try {
      await fetch(`/api/tasks?id=${deletingTask.id}`, { method: "DELETE" });
      setDeletingTask(null);
      fetchData();
    } finally {
      setTaskDeleteLoading(false);
    }
  }

  async function handleProjectDelete() {
    if (!deletingProject) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/projects?id=${deletingProject.id}`, { method: "DELETE" });
      setDeletingProject(null);
      router.push("/projects");
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

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FolderOpen className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-lg text-gray-400">Project not found</p>
        <button
          onClick={() => router.push("/projects")}
          className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === "backlog").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
    estimatedHours: tasks.reduce((sum: number, t: any) => sum + (parseFloat(t.estimated_hours) || 0), 0),
    doneHours: tasks.filter((t: any) => t.status === "done").reduce((sum: number, t: any) => sum + (parseFloat(t.estimated_hours) || 0), 0),
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/projects")}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {project.icon_url ? (
            <img src={project.icon_url} alt={project.name} className="w-10 h-10 rounded-2xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {project.name?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || "bg-gray-100 text-gray-600"}`}>
                {project.status === "in-progress" ? "In Progress" : project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
              </span>
              {project.clients?.name && (
                <span className="text-sm text-gray-500">{project.clients.name}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.quotation_url && (
            <a
              href={project.quotation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              Quotation
            </a>
          )}
          <button
            onClick={() => setEditingProject(project)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingProject(project)}
            className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-2 mb-6">
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-400">Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">{project.progress || 0}%</p>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${project.progress || 0}%` }} />
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Budget</span>
          </div>
          <p className="text-2xl font-bold text-white">${((project.budget || 0) / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-500 mt-1">${((project.spent || 0) / 1000).toFixed(1)}k spent</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Est. Hours</span>
          </div>
          <p className="text-2xl font-bold text-white">{taskStats.estimatedHours > 0 ? taskStats.estimatedHours : "—"}</p>
          {taskStats.estimatedHours > 0 && (
            <p className="text-xs text-gray-500 mt-1">{taskStats.doneHours}h completed</p>
          )}
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Tasks Done</span>
          </div>
          <p className="text-2xl font-bold text-white">{taskStats.done}/{taskStats.total}</p>
          <p className="text-xs text-gray-500 mt-1">{taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0}% completion</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-400">Deadline</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {project.deadline ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
          </p>
          {project.deadline && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(project.deadline) > new Date() ? "On track" : "Overdue"}
            </p>
          )}
        </div>
      </div>

      {project.description && (
        <div className="glass-panel rounded-3xl p-6 mx-2 mb-6 border border-white/5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
        </div>
      )}

      <div className="flex justify-between items-center px-2 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Tasks</h2>
          <span className="text-sm text-gray-500">{tasks.length} total</span>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="px-2 overflow-x-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <FolderOpen className="w-16 h-16 mb-4 text-gray-600" />
            <p className="text-lg font-medium text-gray-500">No tasks yet</p>
            <p className="text-sm text-gray-600 mt-1">Add tasks to track bugs, features, and improvements.</p>
            <button
              onClick={() => setShowNewTask(true)}
              className="mt-4 px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onStatusChange={handleStatusChange}
            onTaskClick={setViewingTask}
          />
        )}
      </div>

      <NewTaskModal
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        onSuccess={fetchData}
        preselectedProjectId={projectId}
      />

      <TaskDetailModal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
        onEdit={setEditingTask}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSuccess={fetchData}
        task={editingTask}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleTaskDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        loading={taskDeleteLoading}
      />

      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={fetchData}
          project={editingProject}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleProjectDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project?.name}"? This action cannot be undone and will also delete all related tasks and time entries.`}
        loading={deleteLoading}
      />
    </div>
  );
}