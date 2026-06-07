"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { X, Upload, FileText, Trash2, ImagePlus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client_id?: string | null;
  status: string;
  deadline?: string | null;
  progress: number;
  budget: number;
  spent: number;
  description?: string | null;
  quotation_url?: string | null;
  icon_url?: string | null;
  clients?: { name: string };
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
}

const statuses = [
  { value: "lead", label: "Lead" },
  { value: "quoted", label: "Quoted" },
  { value: "active", label: "Active" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "delivered", label: "Delivered" },
  { value: "maintenance", label: "Maintenance" },
];

export function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    status: project?.status || "lead",
    deadline: project?.deadline || "",
    budget: project?.budget?.toString() || "",
    spent: project?.spent?.toString() || "",
    progress: project?.progress?.toString() || "0",
    description: project?.description || "",
  });
  const [quotationUrl, setQuotationUrl] = useState(project?.quotation_url || "");
  const [quotationName, setQuotationName] = useState(
    project?.quotation_url ? project.quotation_url.split("/").pop() || "Document" : ""
  );
  const [iconUrl, setIconUrl] = useState(project?.icon_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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

      setQuotationUrl(data.url);
      setQuotationName(file.name);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeQuotation = () => {
    setQuotationUrl("");
    setQuotationName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);
    setError("");

    try {
      const body: any = {
        id: project.id,
        name: formData.name,
        status: formData.status,
        budget: parseFloat(formData.budget) || 0,
        spent: parseFloat(formData.spent) || 0,
        progress: parseInt(formData.progress) || 0,
      };

      if (formData.deadline) body.deadline = formData.deadline;
      if (formData.description.trim()) body.description = formData.description.trim();
      else body.description = null;

      if (quotationUrl) body.quotation_url = quotationUrl;
      else body.quotation_url = null;

      if (iconUrl) body.icon_url = iconUrl;
      else body.icon_url = null;

      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update project");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" maxWidth="max-w-2xl">
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
              <p className="text-xs text-gray-500 mt-0.5">Logo or app icon (PNG, JPG, SVG)</p>
              {iconUrl && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIconUrl(""); }}
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spent ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.spent}
                    onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                    className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-y min-h-[100px]"
                  placeholder="Brief description of the project..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Quotation Document</label>
            {quotationUrl ? (
              <div className="flex items-center gap-3 p-4 bg-[#222226] border border-white/10 rounded-xl">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <a
                  href={quotationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline truncate flex-1"
                >
                  {quotationName}
                </a>
                <button
                  type="button"
                  onClick={removeQuotation}
                  className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-500 mb-3" />
                <p className="text-sm text-gray-400">
                  {uploading ? "Uploading..." : "Click to upload quotation"}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, or images up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
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
            disabled={loading || uploading}
            className="px-6 py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}