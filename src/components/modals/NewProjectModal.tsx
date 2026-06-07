"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { ImagePlus } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    status: "lead",
    deadline: "",
    budget: "",
    description: "",
  });
  const [iconUrl, setIconUrl] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "project-documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setIconUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload icon");
    } finally {
      setUploadingIcon(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = {
        name: formData.name,
        status: formData.status,
        budget: parseFloat(formData.budget) || 0,
        progress: 0,
        spent: 0,
      };

      if (formData.deadline) body.deadline = formData.deadline;
      if (formData.description.trim()) body.description = formData.description.trim();
      if (iconUrl) body.icon_url = iconUrl;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setFormData({ name: "", status: "lead", deadline: "", budget: "", description: "" });
      setIconUrl("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project" maxWidth="max-w-2xl">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <div className="flex items-start gap-5">
            <div
              onClick={() => iconInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl bg-[#222226] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors overflow-hidden shrink-0 relative group"
            >
              {iconUrl ? (
                <>
                  <img src={iconUrl} alt="Project icon" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImagePlus className="w-5 h-5 text-white" />
                  </div>
                </>
              ) : (
                uploadingIcon ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-gray-500" />
                )
              )}
            </div>
            <div className="pt-1">
              <label className="block text-sm font-medium text-gray-300">Project Icon</label>
              <p className="text-xs text-gray-500 mt-0.5">Optional logo or app icon</p>
              {iconUrl && (
                <button
                  type="button"
                  onClick={() => setIconUrl("")}
                  className="text-xs text-red-400 hover:text-red-300 mt-1"
                >
                  Remove icon
                </button>
              )}
            </div>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              onChange={handleIconUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-base text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="e.g., E-Commerce Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
                >
                  <option value="lead" className="bg-[#222226]">Lead</option>
                  <option value="quoted" className="bg-[#222226]">Quoted</option>
                  <option value="active" className="bg-[#222226]">Active</option>
                  <option value="in-progress" className="bg-[#222226]">In Progress</option>
                  <option value="review" className="bg-[#222226]">Review</option>
                  <option value="delivered" className="bg-[#222226]">Delivered</option>
                  <option value="maintenance" className="bg-[#222226]">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-y min-h-[120px]"
                  placeholder="Brief description of the project..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingIcon}
            className="px-6 py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}