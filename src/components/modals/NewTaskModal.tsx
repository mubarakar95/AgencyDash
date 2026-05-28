"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Link2, ImagePlus, X } from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedProjectId?: string;
  preselectedTicketId?: string;
  preselectedTicketData?: { title: string; description: string; project_id: string; priority: string };
}

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

export function NewTaskModal({ isOpen, onClose, onSuccess, preselectedProjectId, preselectedTicketId, preselectedTicketData }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: "",
    type: "task",
    priority: "medium",
    assignee_id: "",
    due_date: "",
    ticket_id: "",
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
    if (isOpen) {
      fetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
      fetch("/api/team").then((r) => r.json()).then(setTeamMembers).catch(() => {});

      const initialProject = preselectedProjectId || preselectedTicketData?.project_id || "";
      const initialTitle = preselectedTicketData?.title || "";
      const initialDescription = preselectedTicketData?.description || "";
      const initialPriority = preselectedTicketData?.priority || "medium";
      const initialTicketId = preselectedTicketId || "";

      setFormData((prev) => ({
        ...prev,
        project_id: initialProject,
        title: initialTitle,
        description: initialDescription,
        priority: initialPriority,
        ticket_id: initialTicketId,
      }));
    }
  }, [isOpen, preselectedProjectId, preselectedTicketId, preselectedTicketData]);

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
    setLoading(true);
    setError("");

    try {
      const body: any = {
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        priority: formData.priority,
        status: "backlog",
        image_urls: imageUrls,
      };
      if (formData.project_id) body.project_id = formData.project_id;
      if (formData.assignee_id) body.assignee_id = formData.assignee_id;
      if (formData.due_date) body.due_date = formData.due_date;
      if (formData.ticket_id) body.ticket_id = formData.ticket_id;
      if (formData.estimated_hours) body.estimated_hours = parseFloat(formData.estimated_hours);

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      setFormData({ title: "", description: "", project_id: "", type: "task", priority: "medium", assignee_id: "", due_date: "", ticket_id: "", estimated_hours: "" });
      setImageUrls([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task" maxWidth="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}
      {preselectedTicketId && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-sm text-blue-300">Linked to ticket — task will track this ticket&apos;s resolution</span>
        </div>
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
                placeholder="Fix login error on mobile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none"
                placeholder="Describe the task..."
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
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}