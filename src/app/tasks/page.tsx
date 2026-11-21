"use client";

import { useEffect, useState } from "react";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { NewTaskModal } from "@/components/modals/NewTaskModal";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClipboardList,
  Plus,
  Search,
  Bug,
  Sparkles,
  ListTodo,
  Lightbulb,
  Timer,
  ImageIcon,
  User,
  MessageSquare,
} from "lucide-react";

const typeFilterConfig: Record<string, { icon: React.ElementType; label: string; active: string }> = {
  bug: { icon: Bug, label: "Bugs", active: "bg-red-500/20 text-red-300 border-red-500/30" },
  feature: { icon: Sparkles, label: "Features", active: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  task: { icon: ListTodo, label: "Tasks", active: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  improvement: { icon: Lightbulb, label: "Improvements", active: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deletingTask, setDeletingTask] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [commentData, setCommentData] = useState<Record<string, { count: number; hasUnread: boolean }>>({});

  function fetchCommentData(taskIds: string[]) {
    if (!user || taskIds.length === 0) return;
    const ids = taskIds.join(",");

    Promise.all([
      fetch(`/api/task-comments?action=counts&task_ids=${ids}`).then((r) => r.json()),
      fetch(`/api/task-comments?action=views&user_id=${user.id}`).then((r) => r.json()),
    ])
      .then(([counts, views]) => {
        const merged: Record<string, { count: number; hasUnread: boolean }> = {};
        for (const taskId of taskIds) {
          const count = (counts as Record<string, number>)[taskId] || 0;
          const hasUnread = count > 0 && !((views as Record<string, string>)[taskId]);
          merged[taskId] = { count, hasUnread };
        }
        setCommentData(merged);
      })
      .catch(() => {});
  }

  function fetchTasks() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterAssignee === "mine" && user) {
      params.set("assignee_id", user.id);
    }
    const qs = params.toString();
    fetch(`/api/tasks${qs ? `?${qs}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        const tasks = Array.isArray(data) ? data : [];
        setTasks(tasks);
        setLoading(false);
        fetchCommentData(tasks.map((t: any) => t.id));
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchTasks();
  }, [filterAssignee]);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
  }, []);

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

  async function handleDelete() {
    if (!deletingTask) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/tasks?id=${deletingTask.id}`, { method: "DELETE" });
      setDeletingTask(null);
      fetchTasks();
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !filterProject || t.project_id === filterProject;
    const matchesType = !filterType || t.type === filterType;
    return matchesSearch && matchesProject && matchesType;
  });

  const stats = {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === "backlog").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
    estimatedHours: tasks.reduce((sum: number, t: any) => sum + (parseFloat(t.estimated_hours) || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Tasks</h1>
          <span className="text-sm text-gray-500">{tasks.length} total</span>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </header>

      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 px-2 gap-4">
        <div className="flex-1">
          <h2 className="text-4xl font-semibold mb-3 tracking-tight text-white">Task Board</h2>
          <p className="text-gray-400 text-lg">Manage bugs, features, and improvements across projects.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2">
          <div className="glass-panel min-w-[140px] h-[72px] rounded-2xl flex items-center justify-between px-4 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">In Progress</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{stats.inProgress} tasks</p>
            </div>
          </div>
          <div className="glass-panel min-w-[140px] h-[72px] rounded-2xl flex items-center justify-between px-4 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">In Review</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{stats.review} tasks</p>
            </div>
          </div>
<div className="glass-panel min-w-[140px] h-[72px] rounded-2xl flex items-center justify-between px-4 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
             <div>
               <div className="flex items-center gap-2">
                 <Timer className="w-4 h-4 text-purple-400" />
                 <span className="font-semibold text-white text-sm">Est. Hours</span>
               </div>
               <p className="text-xs text-gray-400 mt-1">{stats.estimatedHours}h total</p>
             </div>
           </div>
           <div className="glass-panel min-w-[140px] h-[72px] rounded-2xl flex items-center justify-between px-4 cursor-pointer hover:bg-gray-800/80 transition-colors border border-white/5 shrink-0">
             <div>
               <div className="flex items-center gap-2">
                 <span className="font-semibold text-white text-sm">Completed</span>
               </div>
               <p className="text-xs text-gray-400 mt-1">{stats.done} tasks</p>
             </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 px-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
        >
          <option value="" className="bg-[#222226]">All Projects</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id} className="bg-[#222226]">{p.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          {Object.entries(typeFilterConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = filterType === key;
            return (
              <button
                key={key}
                onClick={() => setFilterType(isActive ? "" : key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                  isActive
                    ? config.active
                    : "bg-[#222226] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </button>
            );
          })}
        </div>
        {user && (
          <button
            onClick={() => setFilterAssignee(filterAssignee === "mine" ? "" : "mine")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
              filterAssignee === "mine"
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : "bg-[#222226] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            My Tasks
          </button>
        )}
        <div className="flex items-center gap-1 bg-[#222226] rounded-xl border border-white/10 p-1">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "kanban" ? "bg-white text-gray-900" : "text-gray-400 hover:text-white"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "list" ? "bg-white text-gray-900" : "text-gray-400 hover:text-white"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="px-2 overflow-x-auto">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <ClipboardList className="w-16 h-16 mb-4 text-gray-600" />
              <p className="text-lg font-medium text-gray-500">No tasks yet</p>
              <p className="text-sm text-gray-600 mt-1">Create a task to start tracking work.</p>
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onStatusChange={handleStatusChange}
              onTaskClick={setViewingTask}
              commentData={commentData}
            />
          )}
        </div>
      ) : (
        <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-base font-bold text-white">All Tasks</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {filteredTasks.length} tasks
            </span>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ClipboardList className="w-10 h-10 mb-3 text-gray-500" />
              <p className="text-base font-semibold text-white">No tasks found</p>
            </div>
          ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Task</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center">Priority</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Project</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Hours</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Assignee</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Due</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredTasks.map((task) => {
                    const TypeIcon = typeFilterConfig[task.type]?.icon || ListTodo;
                    const statusColors: Record<string, string> = {
                      backlog: "bg-white/5 text-gray-400 border-white/10",
                      todo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    };
                    const priorityColors: Record<string, string> = {
                      low: "bg-white/5 text-gray-400 border-white/10",
                      medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
                      urgent: "bg-red-500/10 text-red-400 border-red-500/20",
                    };
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                        onClick={() => setViewingTask(task)}
                      >
                        <td className="py-2.5 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                              <TypeIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate max-w-[180px] sm:max-w-[240px]">{task.title}</p>
                                 {Array.isArray(task.image_urls) && task.image_urls.length > 0 && (
                                  <ImageIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                )}
                                {commentData[task.id]?.count > 0 && (
                                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${commentData[task.id]?.hasUnread ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-gray-400"}`}>
                                    <MessageSquare className="w-3 h-3" />
                                    <span className="text-[10px] font-medium">{commentData[task.id].count}</span>
                                  </div>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-[11px] text-gray-400 truncate max-w-[180px] sm:max-w-[240px]">{task.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            task.type === "bug" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            task.type === "feature" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            task.type === "improvement" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-white/5 text-gray-400 border-white/10"
                          }`}>
                            {task.type?.charAt(0).toUpperCase() + task.type?.slice(1)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityColors[task.priority] || "bg-white/5 text-gray-400 border-white/10"}`}>
                            {task.priority?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusColors[task.status] || "bg-white/5 text-gray-400 border-white/10"}`}>
                            {task.status === "in_progress" ? "In Progress" : task.status === "todo" ? "To Do" : task.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-gray-300 truncate max-w-[140px]">{task.projects?.name || "—"}</td>
                        <td className="py-2.5 px-3 sm:px-4 text-right whitespace-nowrap">
                          {task.estimated_hours != null ? (
                            <span className="font-mono text-white font-semibold">{task.estimated_hours}h</span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                          {task.profiles?.full_name || task.profiles?.email ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-[9px] font-bold">
                                {(task.profiles.full_name || task.profiles.email).charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-300">{(task.profiles.full_name || task.profiles.email).split(" ")[0]}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                          {task.due_date ? (
                            <span className={`font-medium ${isOverdue ? "text-red-400" : "text-gray-400"}`}>
                              {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <NewTaskModal
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        onSuccess={fetchTasks}
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
        onSuccess={fetchTasks}
        task={editingTask}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}