"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2, Bug, Sparkles, ListTodo, Lightbulb, User, Calendar, Link2, Clock } from "lucide-react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

const columns = [
  { key: "backlog", label: "Backlog", dot: "bg-gray-400" },
  { key: "todo", label: "To Do", dot: "bg-blue-400" },
  { key: "in_progress", label: "In Progress", dot: "bg-amber-400" },
  { key: "review", label: "Review", dot: "bg-purple-400" },
  { key: "done", label: "Done", dot: "bg-emerald-400" },
];

const typeConfig: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  bug: { icon: Bug, bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
  feature: { icon: Sparkles, bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
  task: { icon: ListTodo, bg: "bg-gray-500/10 border-gray-500/20", text: "text-gray-400" },
  improvement: { icon: Lightbulb, bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
};

const priorityConfig: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-300 border-red-500/30",
};

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  assignee_id: string | null;
  due_date: string | null;
  project_id: string | null;
  ticket_id: string | null;
  image_urls: string[];
  estimated_hours: number | null;
  projects?: { id: string; name: string; icon_url?: string | null } | null;
  profiles?: { id: string; full_name: string; email?: string } | null;
  tickets?: { id: string; title: string; status: string } | null;
  [key: string]: unknown;
}

interface KanbanBoardProps {
  tasks: TaskItem[];
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskClick?: (task: TaskItem) => void;
}

function TaskCard({ task, onEdit, onDelete, onTaskClick, isDragging, dragListeners, onImageClick }: { task: TaskItem; onEdit: (t: TaskItem) => void; onDelete: (t: TaskItem) => void; onTaskClick?: (t: TaskItem) => void; isDragging?: boolean; dragListeners?: Record<string, unknown>; onImageClick?: (urls: string[], index: number) => void }) {
  const TypeIcon = typeConfig[task.type]?.icon || ListTodo;
  const typeBg = typeConfig[task.type]?.bg || "bg-gray-500/10 border-gray-500/20";
  const typeText = typeConfig[task.type]?.text || "text-gray-400";
  const priorityBg = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const images = Array.isArray(task.image_urls) ? task.image_urls : [];

  return (
    <div
      className={`glass-panel rounded-xl p-3.5 border border-white/5 hover:border-white/10 transition-all group ${isDragging ? "opacity-50 scale-95" : ""}`}
      {...dragListeners}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${typeBg} ${typeText}`}>
          <TypeIcon className="w-2.5 h-2.5" />
          {task.type?.charAt(0).toUpperCase() + task.type?.slice(1)}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityBg}`}>
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
        </span>
      </div>

      <p className="text-sm font-medium text-white mb-1.5 leading-snug cursor-pointer hover:underline"
        onClick={() => onTaskClick ? onTaskClick(task) : onEdit(task)}
      >
        {task.title}
      </p>
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      {images.length > 0 && (
        <div className={`grid gap-1 mb-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className="relative group/img cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onImageClick?.(images, i); }}
            >
              <img src={url} alt={`Screenshot ${i + 1}`} className={`w-full object-cover rounded-lg ${images.length === 1 ? 'h-24' : images.length <= 2 ? 'h-20' : 'h-16'}`} />
              {images.length > 4 && i === 3 && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-medium">+{images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {task.projects?.name && (
        <div className="flex items-center gap-1.5 mb-2">
          {task.projects.icon_url ? (
            <img src={task.projects.icon_url} alt="" className="w-3.5 h-3.5 rounded object-cover shrink-0" />
          ) : (
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[6px] font-bold shrink-0">
              {task.projects.name.charAt(0)}
            </div>
          )}
          <p className="text-[10px] text-gray-500 truncate">{task.projects.name}</p>
        </div>
      )}

      {task.tickets?.title && (
        <div className="flex items-center gap-1 mb-2">
          <Link2 className="w-2.5 h-2.5 text-blue-400" />
          <p className="text-[10px] text-blue-400/70 truncate">{task.tickets.title}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          {(() => {
            const p = task.profiles;
            const name = p?.full_name || p?.email;
            return name ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold">
                  {name.charAt(0)}
                </div>
                <span className="text-[10px] text-gray-400">
                  {name.split(" ")[0]}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-gray-600" />
                <span className="text-[10px] text-gray-600">Unassigned</span>
              </div>
            );
          })()}
          {task.due_date && (
            <div className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
              <Calendar className="w-2.5 h-2.5" />
              <span className="text-[10px]">{new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          )}
          {task.estimated_hours != null && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-2.5 h-2.5" />
              <span className="text-[10px]">{task.estimated_hours}h</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="p-1 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onEdit, onDelete, onTaskClick, onImageClick }: { task: TaskItem; onEdit: (t: TaskItem) => void; onDelete: (t: TaskItem) => void; onTaskClick?: (t: TaskItem) => void; onImageClick?: (urls: string[], index: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} onTaskClick={onTaskClick} isDragging={isDragging} onImageClick={onImageClick} />
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-white/[0.02] rounded-2xl p-3 space-y-3 border min-h-[200px] transition-colors ${isOver ? "border-white/20 bg-white/[0.04]" : "border-white/5"}`}
    >
      {children}
    </div>
  );
}

function DragOverlayCard({ task }: { task: TaskItem }) {
  const TypeIcon = typeConfig[task.type]?.icon || ListTodo;
  const typeBg = typeConfig[task.type]?.bg || "bg-gray-500/10 border-gray-500/20";
  const typeText = typeConfig[task.type]?.text || "text-gray-400";
  const priorityBg = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div className="glass-panel rounded-xl p-3.5 border border-white/20 shadow-2xl shadow-black/30 bg-[#1a1a1e] rotate-2 cursor-grabbing" style={{ width: "240px" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${typeBg} ${typeText}`}>
          <TypeIcon className="w-2.5 h-2.5" />
          {task.type?.charAt(0).toUpperCase() + task.type?.slice(1)}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityBg}`}>
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
        </span>
      </div>
      <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
    </div>
  );
}

function findColumn(taskId: string, tasks: TaskItem[]): string | null {
  const task = tasks.find((t) => t.id === taskId);
  return task ? task.status : null;
}

export function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange, onTaskClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId, tasks);
    let overColumn: string | null = null;

    if (columns.some((col) => col.key === overId)) {
      overColumn = overId;
    } else {
      overColumn = findColumn(overId, tasks);
    }

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    onStatusChange(activeId, overColumn);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-4 min-h-[400px]">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className="text-sm font-semibold text-white/90">{col.label}</h3>
                    <span className="text-xs text-gray-500 bg-white/5 rounded-full px-2 py-0.5">{colTasks.length}</span>
                  </div>
                </div>

                <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <DroppableColumn id={col.key}>
                    {colTasks.length === 0 && (
                      <div className="flex items-center justify-center h-24">
                        <p className="text-xs text-gray-600">No tasks</p>
                      </div>
                    )}
                    {colTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onTaskClick={onTaskClick}
                        onImageClick={(urls, index) => { setLightboxImages(urls); setLightboxIndex(index); }}
                      />
                    ))}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <DragOverlayCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

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