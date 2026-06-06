"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabaseClient";
import { Settings, LogOut, Check, User } from "lucide-react";

export function ProfileMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const userEmail = user.email;
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();
        const name = data?.full_name || userEmail?.split('@')[0] || "User";
        setDisplayName(name);
        setSavedName(name);
      } catch {
        const name = userEmail?.split('@')[0] || "User";
        setDisplayName(name);
        setSavedName(name);
      }
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSave() {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ full_name: displayName.trim() })
        .eq('id', user.id);
      setSavedName(displayName.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const initial = (savedName || "U").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.3)]"
        title="Profile"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden bg-[#1c1c20]/95 backdrop-blur-xl">
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{savedName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Display Name</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                className="flex-1 px-3 py-2 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Your display name"
              />
              <button
                onClick={handleSave}
                disabled={saving || !displayName.trim() || displayName.trim() === savedName}
                className={`p-2 rounded-xl transition-all ${
                  saved
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white text-gray-900 hover:scale-105"
                } disabled:opacity-50 shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => { setIsOpen(false); window.location.href = "/settings"; }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => { setIsOpen(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
