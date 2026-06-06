"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Modal } from "@/components/ui/Modal";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabaseClient";
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
  Send,
  ImagePlus,
  X,
  MessageSquare,
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

interface TaskComment {
  id: string;
  task_id: string;
  author_id: string | null;
  author_name: string;
  content: string;
  image_urls: string[];
  created_at: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskDetail | null;
  onEdit: (task: TaskDetail) => void;
}

export function TaskDetailModal({ isOpen, onClose, task, onEdit }: TaskDetailModalProps) {
  const { user } = useAuth();
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [commentImageUrls, setCommentImageUrls] = useState<string[]>([]);
  const [sendingComment, setSendingComment] = useState(false);
  const commentImageInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [profileName, setProfileName] = useState("");

  async function fetchProfileName() {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      if (data?.full_name) setProfileName(data.full_name);
      else if (data?.email) setProfileName(data.email.split('@')[0]);
      else setProfileName(user.email?.split('@')[0] || "Developer");
    } catch {
      setProfileName(user.email?.split('@')[0] || "Developer");
    }
  }

  function fetchComments() {
    if (!task) return;
    setCommentsLoading(true);
    fetch(`/api/task-comments?task_id=${task.id}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setCommentsLoading(false);
      })
      .catch(() => setCommentsLoading(false));
  }

  function markCommentsViewed() {
    if (!user || !task) return;
    fetch("/api/task-comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_viewed", task_id: task.id, user_id: user.id }),
    }).catch(() => {});
  }

  useEffect(() => {
    if (!isOpen) {
      setComments([]);
      setNewComment("");
      setCommentImageUrls([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && task && user) {
      fetchComments();
      markCommentsViewed();
      fetchProfileName();
    }
  }, [isOpen, task?.id, user?.id]);

  useEffect(() => {
    if (comments.length > 0 && !commentsLoading) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length, commentsLoading]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i]);
        fd.append("bucket", "project-documents");

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        setCommentImageUrls((prev) => [...prev, data.url]);
      }
    } catch {
      console.error("Upload failed");
    } finally {
      setUploadingImages(false);
      if (commentImageInputRef.current) commentImageInputRef.current.value = "";
    }
  }

  async function sendComment() {
    if (!newComment.trim() && commentImageUrls.length === 0) return;
    if (!task || !user) return;

    setSendingComment(true);
    try {
      const authorName = profileName || user.email?.split('@')[0] || "Developer";
      const body: Record<string, unknown> = {
        task_id: task.id,
        author_id: user.id,
        author_name: authorName,
        content: newComment.trim() || "(attached image)",
        image_urls: commentImageUrls,
      };

      const res = await fetch("/api/task-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setNewComment("");
        setCommentImageUrls([]);
        fetchComments();
      }
    } finally {
      setSendingComment(false);
    }
  }

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

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-300">Discussion ({comments.length})</h4>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-1">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No comments yet. Start the discussion!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {c.author_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{c.author_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    {c.content && (
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    )}
                    {Array.isArray(c.image_urls) && c.image_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {c.image_urls.map((url, i) => (
                          <div
                            key={i}
                            className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10"
                            onClick={() => { setLightboxImages(c.image_urls); setLightboxIndex(i); }}
                          >
                            <img src={url} alt={`Comment image ${i + 1}`} className="w-24 h-20 object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          <div className="space-y-3">
            {commentImageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {commentImageUrls.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10">
                    <img src={url} alt="" className="w-16 h-14 object-cover" />
                    <button
                      type="button"
                      onClick={() => setCommentImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendComment();
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => commentImageInputRef.current?.click()}
                disabled={uploadingImages}
                className="p-2.5 rounded-xl bg-[#222226] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
              >
                {uploadingImages ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <ImagePlus className="w-5 h-5" />
                )}
              </button>
              <input
                ref={commentImageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={sendComment}
                disabled={sendingComment || (!newComment.trim() && commentImageUrls.length === 0)}
                className="p-2.5 rounded-xl bg-white text-gray-900 hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
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
