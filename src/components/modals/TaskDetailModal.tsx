"use client";

import { Modal } from "@/components/ui/Modal";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useState } from "react";
import {
  Bug,
  Sparkles,
  ListTodo,
  Lightbulb,
  Calendar,
  Clock,
  User,
  FolderKanban,
  Pencil,
  Link2,
} from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  bug: { icon: Bug, label: "Bug" },
  feature: { icon: Sparkles, label: "Feature" },
  task: { icon: ListTodo, label: "Task" },
  improvement: { icon: Lightbulb, label: "Improvement" },
};

const statusColors: Record<string, string> = {
  backlog: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  todo: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  review: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-300 border-red-500/30",
};

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  assignee_id: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  image_urls: string[];
  projects?: { id: string; name: string; icon_url?: string | null } | null;
  profiles?: { id: string; full_name: string; email?: string } | null;
  tickets?: { id: string; title: string; status: string } | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskDetail | null;
  onEdit: (task: TaskDetail) => void;
}

export function TaskDetailModal({ isOpen, onClose, task, onEdit }: TaskDetailModalProps) {
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!task) return null;

  const TypeIcon = typeConfig[task.type]?.icon || ListTodo;
  const assigneeName = task.profiles?.full_name || task.profiles?.email || "Unassigned";
  const images = Array.isArray(task.image_urls) ? task.image_urls : [];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={task.title} maxWidth="max-w-2xl">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${typeConfig[task.type] ? "bg-white/5 text-gray-300 border-white/10" : "bg-white/5 text-gray-300 border-white/10"}`}>
              <TypeIcon className="w-3 h-3" />
              {typeConfig[task.type]?.label || task.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority] || priorityColors.medium}`}>
              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[task.status] || statusColors.backlog}`}>
              {task.status === "in_progress" ? "In Progress" : task.status === "todo" ? "To Do" : task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
            </span>
          </div>

          {task.description && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FolderKanban className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-gray-500">Project</span>
                <span className="text-white ml-auto">{task.projects?.name || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-gray-500">Assignee</span>
                <span className="text-white ml-auto">{assigneeName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-gray-500">Due Date</span>
                <span className={`ml-auto ${task.due_date && new Date(task.due_date) < new Date() && task.status !== "done" ? "text-red-400" : "text-white"}`}>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-gray-500">Est. Hours</span>
                <span className="text-white ml-auto">{task.estimated_hours != null ? `${task.estimated_hours}h` : "—"}</span>
              </div>
            </div>
            <div className="space-y-3">
              {task.tickets?.title && (
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-gray-500">Ticket</span>
                  <span className="text-blue-300 ml-auto text-right truncate max-w-[140px]">{task.tickets.title}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-gray-500">Created</span>
                <span className="text-white ml-auto text-xs">
                  {new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-gray-500">Updated</span>
                <span className="text-white ml-auto text-xs">
                  {new Date(task.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Screenshots ({images.length})
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10"
                    onClick={() => { setLightboxImages(images); setLightboxIndex(i); }}
                  >
                    <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-20 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => { onEdit(task); onClose(); }}
            className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Task
          </button>
        </div>
      </Modal>

      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages(null)}
        />
      )}
    </>
  );
}
