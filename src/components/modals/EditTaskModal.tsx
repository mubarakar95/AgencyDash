"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { ImagePlus, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  project_id: string | null;
  assignee_id: string | null;
  due_date: string | null;
  image_urls?: string[];
  projects?: { id: string; name: string } | null;
  team_members?: { id: string; name: string } | null;
  [key: string]: unknown;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const types = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "task", label: "Task" },
  { value: "improvement", label: "Improvement" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function EditTaskModal({ isOpen, onClose, onSuccess, task }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: "",
    type: "task",
    priority: "medium",
    status: "backlog",
    assignee_id: "",
    due_date: "",
    estimated_hours: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        project_id: task.project_id || "",
        type: task.type || "task",
        priority: task.priority || "medium",
        status: task.status || "backlog",
        assignee_id: task.assignee_id || "",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        estimated_hours: task.estimated_hours != null ? String(task.estimated_hours) : "",
      });
      setImageUrls(Array.isArray(task.image_urls) ? task.image_urls : []);
      fetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
      fetch("/api/team").then((r) => r.json()).then(setTeamMembers).catch(() => {});
    }
  }, [isOpen, task]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i]);
        fd.append("bucket", "project-documents");

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");

        setImageUrls((prev) => [...prev, data.url]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    setError("");

    try {
      const body: any = {
        id: task.id,
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        image_urls: imageUrls,
      };
      if (formData.project_id) body.project_id = formData.project_id;
      else body.project_id = null;
      if (formData.assignee_id) body.assignee_id = formData.assignee_id;
      else body.assignee_id = null;
      if (formData.due_date) body.due_date = formData.due_date;
      else body.due_date = null;
      if (formData.estimated_hours) body.estimated_hours = parseFloat(formData.estimated_hours);
      else body.estimated_hours = null;

      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update task");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task" maxWidth="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Screenshots <span className="text-gray-500 font-normal">({imageUrls.length})</span>
              </label>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10">
                      <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 p-3 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors"
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Add screenshots</span>
                  </>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.status === s.value
                        ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.type === t.value
                        ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.priority === p.value
                        ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="" className="bg-[#222226]">No project</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id} className="bg-[#222226]">{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Assignee</label>
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="" className="bg-[#222226]">Unassigned</option>
                {teamMembers.map((m: any) => (
                  <option key={m.id} value={m.id} className="bg-[#222226]">{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Est. Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}